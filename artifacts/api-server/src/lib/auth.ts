import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { eq } from "drizzle-orm";
import { db, bookingsTable, platformMetricsTable, sessionsTable, usersTable, type User } from "@workspace/db";
import { inArray, sql } from "drizzle-orm";
import { coaches } from "./dabble-data";
import sampleBookings from "../../../../attached_assets/sample-bookings_1789813171794.json";

const scrypt = promisify(scryptCallback);
export const SESSION_COOKIE = "dabble_session";
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const [, salt, expectedHex] = encoded.split(":");
  if (!salt || !expectedHex) return false;
  const expected = Buffer.from(expectedHex, "hex");
  const actual = (await scrypt(password, salt, expected.length)) as Buffer;
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function parseCookies(header: string | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  for (const part of (header ?? "").split(";")) {
    const index = part.indexOf("=");
    if (index < 0) continue;
    const key = part.slice(0, index).trim();
    try { result[key] = decodeURIComponent(part.slice(index + 1).trim()); } catch { /* ignore malformed cookie */ }
  }
  return result;
}

export async function createSession(userId: string) {
  await db.delete(sessionsTable).where(eq(sessionsTable.userId, userId));
  const token = randomBytes(32).toString("base64url");
  await db.insert(sessionsTable).values({
    tokenHash: hashSessionToken(token),
    userId,
    expiresAt: new Date(Date.now() + SESSION_TTL),
  });
  return token;
}

export function sessionCookie(token: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${Math.floor(SESSION_TTL / 1000)}${secure}`;
}

export async function getSessionUser(cookieHeader: string | undefined): Promise<User | null> {
  const token = parseCookies(cookieHeader)[SESSION_COOKIE];
  if (!token) return null;
  const hash = hashSessionToken(token);
  const [session] = await db.select().from(sessionsTable).where(eq(sessionsTable.tokenHash, hash));
  if (!session) return null;
  if (session.expiresAt <= new Date()) {
    await db.delete(sessionsTable).where(eq(sessionsTable.tokenHash, hash));
    return null;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, session.userId));
  return user ?? null;
}

export async function deleteSession(cookieHeader: string | undefined) {
  const token = parseCookies(cookieHeader)[SESSION_COOKIE];
  if (token) await db.delete(sessionsTable).where(eq(sessionsTable.tokenHash, hashSessionToken(token)));
}

export async function seedDemoUsers() {
  const demos = [
    { email: "parent@demo.com", displayName: "Demo Parent", role: "parent" as const, linkedCoachId: null },
    { email: "coach@demo.com", displayName: "Coach Deepak R.", role: "coach" as const, linkedCoachId: "exp-036" },
    { email: "ops@demo.com", displayName: "Dabble Operations", role: "employee" as const, linkedCoachId: null },
  ];
  const passwordHash = await hashPassword("demo1234");
  for (const demo of demos) {
    await db.insert(usersTable).values({ ...demo, passwordHash }).onConflictDoUpdate({
      target: usersTable.email,
      set: { displayName: demo.displayName, role: demo.role, linkedCoachId: demo.linkedCoachId },
    });
  }
  const [parent] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, "parent@demo.com"));
  if (!parent) return;
  await db.delete(bookingsTable).where(sql`${bookingsTable.id} LIKE 'DBL-DEMO-%'`);
  await db.delete(bookingsTable).where(inArray(bookingsTable.id, sampleBookings.bookings.map((booking) => booking.bookingId)));
  const rows = sampleBookings.bookings.map((fixture) => {
    const coach = coaches.find((item) => item.id === fixture.experienceId);
    if (!coach) throw new Error(`Seed booking references missing catalog coach ${fixture.experienceId}`);
    const slot = {
      id: `${fixture.experienceId}-${fixture.slot.date}-${fixture.slot.time}`,
      day: fixture.slot.date, date: fixture.slot.date, time: fixture.slot.time, label: fixture.slot.time,
    };
    const isDemoParent = ["bk-1001", "bk-1005", "bk-1016"].includes(fixture.bookingId);
    return {
      id: fixture.bookingId, parentUserId: isDemoParent ? parent.id : null,
      coachId: fixture.experienceId, slotId: slot.id, childName: fixture.childName, childAge: fixture.childAge,
      parentName: fixture.parentName, parentEmail: isDemoParent ? "parent@demo.com" : fixture.parentName.toLowerCase().replaceAll(" ", ".") + "@example.com",
      parentPhone: "", seats: fixture.seats, trialFee: fixture.amount, serviceFee: fixture.dabbleFee,
      coachFee: fixture.amount, dabbleFee: fixture.dabbleFee, total: fixture.amount, amount: fixture.amount,
      coachEarning: fixture.coachEarning, category: fixture.category, area: fixture.area, status: fixture.status as "paid" | "pending",
      slotDate: fixture.slot.date, slotTime: fixture.slot.time, coachSnapshot: coach, slotSnapshot: slot,
      paymentOrderId: null, paymentId: fixture.paymentId,
      createdAt: new Date(fixture.createdAt),
    };
  });
  await db.insert(bookingsTable).values(rows).onConflictDoNothing();
  await db.insert(platformMetricsTable).values({ id: 1, periodLabel: "Last 30 days", searchCount: 342, newParentSignups: 128, activeCoaches: 15, societiesLive: 3 })
    .onConflictDoUpdate({ target: platformMetricsTable.id, set: { periodLabel: "Last 30 days", activeCoaches: 15, societiesLive: 3 } });
}

export function isValidPassword(password: string) { return typeof password === "string" && password.length >= 8; }