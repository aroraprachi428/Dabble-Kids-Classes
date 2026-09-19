import assert from "node:assert/strict";
import http from "node:http";
import { createHmac } from "node:crypto";
import { after, before, test } from "node:test";
import fixture from "../../../attached_assets/sample-bookings_1789813171794.json";

process.env.NODE_ENV = "test";
process.env.RAZORPAY_KEY_ID = "test_key";
process.env.RAZORPAY_KEY_SECRET = "test_secret";

type Reply = { status: number; body: any; cookie?: string };
let server: http.Server;
let port: number;
let app: any;
let db: any;
let bookingsTable: any;
let sessionsTable: any;
let usersTable: any;
const originalFetch = globalThis.fetch;
let providerOrder = 0;
const uniqueEmail = `integration-${process.pid}@example.test`;
const createdBookingIds: string[] = [];

before(async () => {
  ({ default: app } = await import("../src/app"));
  ({ db, bookingsTable, sessionsTable, usersTable } = await import("@workspace/db"));
  server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  port = (server.address() as any).port;
  globalThis.fetch = async () => new Response(JSON.stringify({ id: `order_it_${++providerOrder}` }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
});

after(async () => {
  try {
    if (db) {
      const { eq, inArray } = await import("drizzle-orm");
      if (createdBookingIds.length > 0) {
        await db.delete(bookingsTable).where(inArray(bookingsTable.id, createdBookingIds));
      }
      const [user] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, uniqueEmail));
      if (user) {
        await db.delete(sessionsTable).where(eq(sessionsTable.userId, user.id));
        await db.delete(usersTable).where(eq(usersTable.id, user.id));
      }
      await db.$client?.end?.();
    }
  } finally {
    globalThis.fetch = originalFetch;
    if (server) await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

function request(method: string, path: string, body?: unknown, cookie?: string): Promise<Reply> {
  return new Promise((resolve, reject) => {
    const payload = body === undefined ? "" : JSON.stringify(body);
    const req = http.request({ host: "127.0.0.1", port, path, method,
      headers: { ...(payload ? { "content-type": "application/json", "content-length": Buffer.byteLength(payload) } : {}),
        ...(cookie ? { cookie } : {}) } }, (res) => {
      let text = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => { text += chunk; });
      res.on("end", () => {
        let parsed: any = text;
        try { parsed = JSON.parse(text); } catch { /* empty response */ }
        const setCookie = res.headers["set-cookie"]?.[0]?.split(";")[0];
        resolve({ status: res.statusCode ?? 0, body: parsed, cookie: setCookie });
      });
    });
    req.on("error", reject);
    req.end(payload);
  });
}

async function login(email: string) {
  const response = await request("POST", "/api/auth/login", { email, password: "demo1234" });
  assert.equal(response.status, 200);
  assert.ok(response.cookie);
  const me = await request("GET", "/api/auth/me", undefined, response.cookie);
  assert.equal(me.status, 200);
  return { cookie: response.cookie!, me: me.body };
}

test("P0/P1 HTTP integration uses the seeded database and cleans dynamic rows", async () => {
  const parent = await login("parent@demo.com");
  const coach = await login("coach@demo.com");
  const employee = await login("ops@demo.com");
  assert.equal(parent.me.role, "parent");
  assert.equal(coach.me.role, "coach");
  assert.equal(coach.me.linkedCoachId, "exp-036");
  assert.equal(employee.me.role, "employee");

  assert.equal((await request("GET", "/api/coaches")).status, 200);
  assert.equal((await request("POST", "/api/recommend", { query: "tennis for an 8 year old in Whitefield" })).status, 200);
  const plan = await request("POST", "/api/plan", { childAge: 8, budget: 50000 });
  assert.equal(plan.status, 200);
  assert.ok(plan.body.activities.length >= 2 && plan.body.activities.length <= 4);
  assert.ok(plan.body.activities.every((item: any) => item.id.startsWith("exp-")));
  assert.ok(plan.body.monthlyTotalEstimate <= 50000);
  assert.equal((await request("POST", "/api/order", { coachId: "exp-036", slotId: "bad", seats: 1 })).status, 401);

  const parentBookings = await request("GET", "/api/parent/bookings", undefined, parent.cookie);
  assert.equal(parentBookings.status, 200);
  assert.deepEqual(parentBookings.body.map((row: any) => row.id).sort(), ["bk-1001", "bk-1005", "bk-1016"]);
  for (const path of ["/api/coach-dashboard", "/api/analytics", "/api/ops"]) {
    assert.equal((await request("GET", path, undefined, parent.cookie)).status, 403);
  }
  const coachDashboard = await request("GET", "/api/coach-dashboard", undefined, coach.cookie);
  assert.equal(coachDashboard.status, 200);
  assert.ok(coachDashboard.body.bookings.every((row: any) => row.coachId === "exp-036"));
  assert.equal(coachDashboard.body.totals.totalEarnings, fixture.bookings
    .filter((row) => row.experienceId === "exp-036" && row.status === "paid")
    .reduce((sum, row) => sum + row.coachEarning, 0));
  assert.equal((await request("GET", "/api/ops", undefined, coach.cookie)).status, 403);
  assert.equal((await request("GET", "/api/parent/bookings", undefined, coach.cookie)).status, 403);

  const initialOps = await request("GET", "/api/ops", undefined, employee.cookie);
  const paid = fixture.bookings.filter((row) => row.status === "paid");
  assert.equal(initialOps.body.GMV, paid.reduce((sum, row) => sum + row.amount, 0));
  assert.equal(initialOps.body.dabbleRevenue, paid.reduce((sum, row) => sum + row.dabbleFee, 0));
  assert.equal(initialOps.body.pendingBookings, fixture.bookings.filter((row) => row.status === "pending").length);
  assert.equal(
    initialOps.body.conversion,
    (fixture.bookings.length / initialOps.body.searches) * 100,
  );

  const signup = await request("POST", "/api/auth/signup", { name: "Integration Coach", email: uniqueEmail, password: "integration123", role: "coach" });
  assert.equal(signup.status, 201);
  const newCoachDashboard = await request("GET", "/api/coach-dashboard", undefined, signup.cookie);
  assert.equal(newCoachDashboard.status, 200);
  assert.equal(newCoachDashboard.body.coach, null);
  assert.deepEqual(newCoachDashboard.body.bookings, []);
  assert.equal(newCoachDashboard.body.totals.totalEarnings, 0);

  const coachProfile = (await request("GET", "/api/coaches/exp-036")).body;
  const slot = coachProfile.slots[0];
  const order = await request("POST", "/api/order", { coachId: "exp-036", slotId: slot.id, seats: 1 }, parent.cookie);
  assert.equal(order.status, 200);
  const paymentId = "pay_integration_1";
  const signature = createHmac("sha256", "test_secret").update(`${order.body.orderId}|${paymentId}`).digest("hex");
  const payment = await request("POST", "/api/verify", {
    ...{ coachId: "exp-036", slotId: slot.id, childName: "Integration Child", childAge: 8,
      parentName: "Demo Parent", parentEmail: "parent@demo.com", parentPhone: "9999999999", seats: 1 },
    orderId: order.body.orderId, paymentId, signature,
  }, parent.cookie);
  assert.equal(payment.status, 201);
  assert.ok(payment.body.id);
  createdBookingIds.push(payment.body.id);
  const afterBooking = await request("GET", "/api/parent/bookings", undefined, parent.cookie);
  const persisted = afterBooking.body.find((row: any) => row.id === payment.body.id);
  assert.ok(persisted);
  assert.equal(persisted.status, "paid");

  const second = await request("POST", "/api/order", { coachId: "exp-036", slotId: slot.id, seats: 1 }, parent.cookie);
  const bad = await request("POST", "/api/verify", {
    coachId: "exp-036", slotId: slot.id, childName: "Tampered", childAge: 8,
    parentName: "Demo Parent", parentEmail: "parent@demo.com", parentPhone: "9999999999", seats: 1,
    orderId: second.body.orderId, paymentId: "pay_integration_2", signature: "tampered",
  }, parent.cookie);
  assert.equal(bad.status, 400);
  const finalOps = await request("GET", "/api/ops", undefined, employee.cookie);
  assert.equal(finalOps.body.GMV, initialOps.body.GMV + order.body.coachFee);
  assert.equal(finalOps.body.pendingBookings, initialOps.body.pendingBookings);
});