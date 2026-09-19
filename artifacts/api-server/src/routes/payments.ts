import {
  createHmac,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import { Router, type IRouter } from "express";
import {
  CreatePaymentOrderBody,
  CreatePaymentOrderResponse,
  VerifyPaymentBody,
  VerifyPaymentResponse,
} from "@workspace/api-zod";
import {
  bookings,
  calculateBookingPricing,
  coaches,
  type Booking,
} from "../lib/dabble-data";

const router: IRouter = Router();
const pendingOrders = new Map<
  string,
  {
    mode: "razorpay" | "simulated";
    coachId: string;
    slotId: string;
    seats: number;
    expiresAt: number;
  }
>();
const ORDER_TTL_MS = 15 * 60 * 1000;

function configuredRazorpay() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

function purgeExpired(orderId: string) {
  const order = pendingOrders.get(orderId);
  if (order && order.expiresAt <= Date.now()) {
    pendingOrders.delete(orderId);
    return undefined;
  }
  return order;
}

router.post("/order", async (req, res): Promise<void> => {
  const parsed = CreatePaymentOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { coachId, slotId, seats } = parsed.data;
  const coach = coaches.find((item) => item.id === coachId);
  const slot = coach?.slots.find((item) => item.id === slotId);
  if (!coach || !slot) {
    res.status(400).json({ error: "That coach or trial slot is unavailable" });
    return;
  }
  const { coachFee, dabbleFee, total } = calculateBookingPricing(coach.price, seats);
  const mode = configuredRazorpay() ? "razorpay" : "simulated";
  let orderId: string;
  if (mode === "razorpay") {
    const auth = Buffer.from(
      `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`,
    ).toString("base64");
    let providerResponse: Response;
    try {
      providerResponse = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: total * 100,
          currency: "INR",
          receipt: `dabble_${randomUUID()}`,
        }),
      });
    } catch {
      res.status(502).json({ error: "Payment provider is unavailable" });
      return;
    }
    if (!providerResponse.ok) {
      res.status(502).json({ error: "Payment provider rejected the order" });
      return;
    }
    const providerOrder = (await providerResponse.json()) as { id?: unknown };
    if (typeof providerOrder.id !== "string" || providerOrder.id.length === 0) {
      res.status(502).json({ error: "Payment provider returned an invalid order" });
      return;
    }
    orderId = providerOrder.id;
  } else {
    orderId = `sim_${randomBytes(24).toString("hex")}`;
  }
  pendingOrders.set(orderId, {
    mode,
    coachId,
    slotId,
    seats,
    expiresAt: Date.now() + ORDER_TTL_MS,
  });
  res.json(
    CreatePaymentOrderResponse.parse({
      mode,
      orderId,
      keyId: mode === "razorpay" ? process.env.RAZORPAY_KEY_ID : "",
      amount: total,
      amountPaise: total * 100,
      currency: "INR",
      coachFee,
      dabbleFee,
      total,
      seats,
    }),
  );
});

router.post("/verify", (req, res): void => {
  const parsed = VerifyPaymentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const data = parsed.data;
  const pending = purgeExpired(data.orderId);
  if (!pending) {
    res.status(404).json({ error: "Payment order not found or expired" });
    return;
  }
  if (
    pending.coachId !== data.coachId ||
    pending.slotId !== data.slotId ||
    pending.seats !== data.seats
  ) {
    res.status(400).json({ error: "Payment order does not match the booking" });
    return;
  }
  if (pending.mode === "razorpay") {
    if (!configuredRazorpay() || !data.paymentId || !data.signature) {
      res.status(400).json({ error: "Payment proof is required" });
      return;
    }
    const expected = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${data.orderId}|${data.paymentId}`)
      .digest("hex");
    const expectedBuffer = Buffer.from(expected);
    const actualBuffer = Buffer.from(data.signature);
    if (
      expectedBuffer.length !== actualBuffer.length ||
      !timingSafeEqual(expectedBuffer, actualBuffer)
    ) {
      res.status(400).json({ error: "Invalid payment signature" });
      return;
    }
  } else if (configuredRazorpay()) {
    res.status(400).json({ error: "Simulated payment is no longer valid" });
    return;
  }
  const coach = coaches.find((item) => item.id === data.coachId);
  const slot = coach?.slots.find((item) => item.id === data.slotId);
  if (!coach || !slot) {
    res.status(400).json({ error: "That coach or trial slot is unavailable" });
    return;
  }
  const { coachFee, dabbleFee, total } = calculateBookingPricing(coach.price, data.seats);
  const id = `DBL-${randomBytes(3).toString("hex").toUpperCase()}`;
  const booking: Booking = {
    ...data,
    id,
    coach,
    slot,
    trialFee: coachFee,
    serviceFee: dabbleFee,
    coachFee,
    dabbleFee,
    total,
    createdAt: new Date().toISOString(),
  };
  pendingOrders.delete(data.orderId);
  bookings.set(id, booking);
  res.status(201).json(VerifyPaymentResponse.parse(booking));
});

export default router;