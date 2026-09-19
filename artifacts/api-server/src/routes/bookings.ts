import { randomBytes } from "node:crypto";
import { Router, type IRouter } from "express";
import {
  CreateBookingBody,
  CreateBookingResponse,
  GetBookingParams,
  GetBookingResponse,
} from "@workspace/api-zod";
import { bookings, coaches, calculateBookingPricing, type Booking } from "../lib/dabble-data";

const router: IRouter = Router();

router.post("/bookings", (req, res): void => {
  const parsed = CreateBookingBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid trial booking");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const coach = coaches.find((item) => item.id === parsed.data.coachId);
  const slot = coach?.slots.find((item) => item.id === parsed.data.slotId);
  if (!coach || !slot) {
    res.status(400).json({ error: "That coach or trial slot is unavailable" });
    return;
  }

  const seats = parsed.data.seats ?? 1;
  const { coachFee, dabbleFee, total } = calculateBookingPricing(coach.price, seats);
  const id = `DBL-${randomBytes(3).toString("hex").toUpperCase()}`;
  const booking: Booking = {
    ...parsed.data,
    seats,
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

  bookings.set(id, booking);
  req.log.info({ bookingId: id, coachId: coach.id }, "Trial booking created");
  res.status(201).json(CreateBookingResponse.parse(booking));
});

router.get("/bookings/:bookingId", (req, res): void => {
  const parsed = GetBookingParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const booking = bookings.get(parsed.data.bookingId);
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  res.json(GetBookingResponse.parse(booking));
});

export default router;
