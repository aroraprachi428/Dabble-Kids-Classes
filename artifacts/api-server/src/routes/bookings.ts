import { randomBytes } from "node:crypto";
import { Router, type IRouter } from "express";
import {
  CreateBookingBody,
  CreateBookingResponse,
  GetBookingParams,
  GetBookingResponse,
} from "@workspace/api-zod";
import { bookings, coaches, catalogExperiences, calculateBookingPricing, type Booking } from "../lib/dabble-data";
import { requireRole } from "../middleware/auth";
import { db, bookingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.post("/bookings", requireRole("parent"), async (req, res): Promise<void> => {
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
  await db.insert(bookingsTable).values({
    id, parentUserId: req.user!.id, coachId: booking.coachId, slotId: booking.slotId,
    childName: booking.childName, childAge: booking.childAge, parentName: booking.parentName,
    parentEmail: booking.parentEmail, parentPhone: booking.parentPhone, seats: booking.seats,
    trialFee: booking.trialFee, serviceFee: booking.serviceFee, coachFee: booking.coachFee,
    dabbleFee: booking.dabbleFee, total: booking.total, coachSnapshot: coach, slotSnapshot: slot,
    amount: booking.coachFee, coachEarning: booking.coachFee, category: catalogExperiences.find((item) => item.id === coach.id)?.category ?? coach.activity, area: coach.area,
    status: "paid", slotDate: slot.date, slotTime: slot.time,
  });
  req.log.info({ bookingId: id, coachId: coach.id }, "Trial booking created");
  res.status(201).json(CreateBookingResponse.parse(booking));
});

router.get("/bookings/:bookingId", requireRole("parent", "coach"), async (req, res): Promise<void> => {
  const parsed = GetBookingParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  let booking = bookings.get(parsed.data.bookingId);
  if (!booking) {
    const [record] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, parsed.data.bookingId));
    if (record) {
      const coach = coaches.find((item) => item.id === record.coachId);
      if (coach && (req.user!.role === "coach" ? req.user!.linkedCoachId === record.coachId : req.user!.id === record.parentUserId)) {
        booking = { ...record, coach, slot: record.slotSnapshot as Booking["slot"], createdAt: record.createdAt.toISOString() };
      }
    }
  }
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }
  const [ownership] = await db.select({ parentUserId: bookingsTable.parentUserId, coachId: bookingsTable.coachId })
    .from(bookingsTable).where(eq(bookingsTable.id, parsed.data.bookingId));
  if (ownership && (req.user!.role === "parent" ? ownership.parentUserId !== req.user!.id : ownership.coachId !== req.user!.linkedCoachId)) {
    res.status(404).json({ error: "Booking not found" }); return;
  }

  res.json(GetBookingResponse.parse(booking));
});

export default router;
