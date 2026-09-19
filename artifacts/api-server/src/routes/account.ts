import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, bookingsTable, kidProfilesTable, platformMetricsTable } from "@workspace/db";
import { requireRole } from "../middleware/auth";
import { coaches } from "../lib/dabble-data";

const router: IRouter = Router();
router.get("/parent/kids", requireRole("parent"), async (req, res): Promise<void> => {
  const rows = await db.select().from(kidProfilesTable).where(eq(kidProfilesTable.parentUserId, req.user!.id));
  res.json(rows);
});
router.post("/parent/kids", requireRole("parent"), async (req, res): Promise<void> => {
  const { name, age } = req.body ?? {};
  if (typeof name !== "string" || !name.trim() || !Number.isInteger(age) || age < 4) {
    res.status(400).json({ error: "Name and age (minimum 4) are required" }); return;
  }
  const [kid] = await db.insert(kidProfilesTable).values({ parentUserId: req.user!.id, name: name.trim(), age }).returning();
  res.status(201).json(kid);
});
router.get("/parent/bookings", requireRole("parent"), async (req, res): Promise<void> => {
  const rows = await db.select().from(bookingsTable).where(eq(bookingsTable.parentUserId, req.user!.id));
  res.json(rows.map((row) => ({ ...row, coach: row.coachSnapshot, slot: row.slotSnapshot, createdAt: row.createdAt.toISOString() })));
});
router.get("/coach-dashboard", requireRole("coach"), async (req, res): Promise<void> => {
  const coachId = req.user!.linkedCoachId;
  const profile = coachId ? coaches.find((coach) => coach.id === coachId) : undefined;
  const rows = coachId ? await db.select().from(bookingsTable).where(eq(bookingsTable.coachId, coachId)) : [];
  const today = new Date().toISOString().slice(0, 10);
  const bookings = rows.map((row) => ({ ...row, parent: row.parentName, activity: row.category, coach: row.coachSnapshot, slot: { date: row.slotDate, time: row.slotTime }, createdAt: row.createdAt.toISOString() }))
    .sort((a, b) => (a.slot.date >= today ? 0 : 1) - (b.slot.date >= today ? 0 : 1) || a.slot.date.localeCompare(b.slot.date));
  res.json({
    coach: profile ?? null,
    upcomingSessions: bookings.filter((row) => row.slot.date >= today).length,
    bookings,
    myOffers: profile ? profile.slots.length ? [{
      title: profile.activity, format: profile.sessionFormats, venueType: profile.venueType,
      ageRange: profile.ageRange, price: profile.price, spotsLeft: Number(profile.highlights.find((item) => item.includes("spots"))?.match(/\d+/)?.[0] ?? 0),
    }] : [] : [],
    totals: {
      bookingCount: rows.length,
      seatsBooked: rows.reduce((sum, row) => sum + row.seats, 0),
      GMV: rows.filter((row) => row.status === "paid").reduce((sum, row) => sum + row.amount, 0),
      coachEarnings: rows.filter((row) => row.status === "paid").reduce((sum, row) => sum + row.coachEarning, 0),
      revenue: rows.filter((row) => row.status === "paid").reduce((sum, row) => sum + row.coachEarning, 0),
      totalBookings: rows.length,
      totalEarnings: rows.filter((row) => row.status === "paid").reduce((sum, row) => sum + row.coachEarning, 0),
      pendingConfirmations: rows.filter((row) => row.status === "pending").length,
    },
  });
});
const opsHandler = async (_req: Request, res: Response): Promise<void> => {
  const rows = await db.select().from(bookingsTable);
  const [metrics] = await db.select().from(platformMetricsTable);
  const by = (field: "activity" | "area") => {
    const groups = new Map<string, { bookings: number; GMV: number }>();
    for (const row of rows) {
      const coach = row.coachSnapshot as { activity?: string; area?: string };
      const key = field === "activity" ? row.category : row.area;
      const current = groups.get(key) ?? { bookings: 0, GMV: 0 };
      current.bookings += 1; if (row.status === "paid") current.GMV += row.amount; groups.set(key, current);
    }
    return [...groups.entries()].map(([label, values]) => ({ label, ...values }));
  };
  const coachGroups = new Map<string, { coachId: string; coachName: string; bookings: number; seatsBooked: number; GMV: number; coachEarnings: number }>();
  for (const row of rows) {
    const coach = row.coachSnapshot as { name?: string };
    const current = coachGroups.get(row.coachId) ?? { coachId: row.coachId, coachName: coach.name ?? row.coachId, bookings: 0, seatsBooked: 0, GMV: 0, coachEarnings: 0 };
    current.bookings += 1; current.seatsBooked += row.seats;
    if (row.status === "paid") { current.GMV += row.amount; current.coachEarnings += row.coachEarning; }
    coachGroups.set(row.coachId, current);
  }
  const paid = rows.filter((row) => row.status === "paid");
  const timeGroups = new Map<string, { label: string; bookings: number; GMV: number }>();
  for (const row of rows) {
    const label = row.createdAt.toISOString().slice(0, 10);
    const point = timeGroups.get(label) ?? { label, bookings: 0, GMV: 0 };
    point.bookings += 1; if (row.status === "paid") point.GMV += row.amount; timeGroups.set(label, point);
  }
  res.json({
    periodLabel: metrics?.periodLabel ?? "Last 30 days",
    GMV: paid.reduce((sum, row) => sum + row.amount, 0),
    dabbleRevenue: paid.reduce((sum, row) => sum + row.dabbleFee, 0),
    totalBookings: rows.length, pendingBookings: rows.filter((row) => row.status === "pending").length,
    activeCoaches: metrics?.activeCoaches ?? 0, searches: metrics?.searchCount ?? 0,
    conversion: metrics?.searchCount ? (rows.length / metrics.searchCount) * 100 : 0,
    avgBookingValue: paid.length ? paid.reduce((sum, row) => sum + row.amount, 0) / paid.length : 0,
    newParentSignups: metrics?.newParentSignups ?? 0, societiesLive: metrics?.societiesLive ?? 0,
    bookingsByCategory: by("activity"),
    bookingsByArea: by("area"),
    bookingsOverTime: [...timeGroups.values()].sort((a, b) => a.label.localeCompare(b.label)),
    topCoaches: [...coachGroups.values()].sort((a, b) => b.GMV - a.GMV).slice(0, 10)
      .map((coach) => ({ ...coach, revenue: coach.coachEarnings })),
    recentBookings: [...rows].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 20).map((row) => ({
      parent: row.parentName, child: row.childName, activity: row.category,
      coach: (row.coachSnapshot as { name?: string }).name ?? row.coachId,
      amount: row.amount, status: row.status, time: row.slotDate + " " + row.slotTime,
    })),
  });
};
router.get("/ops", requireRole("employee"), opsHandler);
router.get("/analytics", requireRole("employee"), opsHandler);
export default router;