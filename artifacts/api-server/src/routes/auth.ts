import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, platformMetricsTable, usersTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { createSession, deleteSession, hashPassword, isValidPassword, sessionCookie, verifyPassword } from "../lib/auth";
import { requireAuth } from "../middleware/auth";

const router: IRouter = Router();
const invalid = "Invalid email or password";

router.post("/auth/signup", async (req, res): Promise<void> => {
  const { name, email, password, role } = req.body ?? {};
  if (typeof name !== "string" || !name.trim() || typeof email !== "string" || !email.includes("@") ||
      !isValidPassword(password) || (role !== "parent" && role !== "coach")) {
    res.status(400).json({ error: "Name, valid email, password (8+ characters), and role are required" }); return;
  }
  const normalizedEmail = email.trim().toLowerCase();
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, normalizedEmail));
  if (existing) { res.status(409).json({ error: "An account with that email already exists" }); return; }
  const [user] = await db.insert(usersTable).values({
    displayName: name.trim(), email: normalizedEmail, passwordHash: await hashPassword(password), role, linkedCoachId: null,
  }).returning();
  if (role === "parent") {
    await db.update(platformMetricsTable).set({
      newParentSignups: sql`${platformMetricsTable.newParentSignups} + 1`,
      updatedAt: new Date(),
    }).where(eq(platformMetricsTable.id, 1));
  }
  const token = await createSession(user.id);
  res.setHeader("Set-Cookie", sessionCookie(token));
  res.status(201).json({ id: user.id, email: user.email, name: user.displayName, role: user.role, linkedCoachId: user.linkedCoachId });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string") { res.status(401).json({ error: invalid }); return; }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.trim().toLowerCase()));
  if (!user || !(await verifyPassword(password, user.passwordHash))) { res.status(401).json({ error: invalid }); return; }
  const token = await createSession(user.id);
  res.setHeader("Set-Cookie", sessionCookie(token));
  res.json({ id: user.id, email: user.email, name: user.displayName, role: user.role, linkedCoachId: user.linkedCoachId });
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  await deleteSession(req.headers.cookie);
  res.setHeader("Set-Cookie", `${"dabble_session"}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
  res.json({ success: true });
});

router.get("/auth/me", requireAuth, (req, res) => {
  const user = req.user!;
  res.json({ id: user.id, email: user.email, name: user.displayName, role: user.role, linkedCoachId: user.linkedCoachId });
});
export default router;