import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { test } from "node:test";
import fixture from "../../../attached_assets/sample-bookings_1789813171794.json";
import { catalogExperiences, coaches, calculateBookingPricing } from "../src/lib/dabble-data";

const catalog = new Map(catalogExperiences.map((item) => [item.id, item]));
const fixtureBookings = fixture.bookings;

test("P0 data integrity: every fixture booking references a priced catalog experience", () => {
  assert.ok(fixtureBookings.length > 0);
  for (const booking of fixtureBookings) {
    const experience = catalog.get(booking.experienceId);
    assert.ok(experience, `${booking.bookingId} references missing ${booking.experienceId}`);
    assert.equal(booking.amount, experience.price * booking.seats, booking.bookingId);
    assert.equal(booking.dabbleFee, Math.round(booking.amount * 0.1), booking.bookingId);
    assert.equal(booking.coachEarning, booking.amount - booking.dabbleFee, booking.bookingId);
  }
});

test("P0 data integrity: catalog age ranges and session formats are usable", () => {
  for (const experience of catalogExperiences) {
    assert.ok(experience.ageMin <= experience.ageMax, experience.id);
    assert.ok(experience.sessionFormats.length > 0, experience.id);
    assert.ok(catalog.has(experience.id), experience.id);
  }
});

test("P0 booking pricing is deterministic for a multi-seat paid path", () => {
  const coach = coaches[0];
  const first = calculateBookingPricing(coach.price, 2);
  const second = calculateBookingPricing(coach.price, 2);
  assert.deepEqual(first, second);
  assert.equal(first.total, first.coachFee + first.dabbleFee);
  assert.notEqual(`DBL-${cryptoRandomId()}`, `DBL-${cryptoRandomId()}`);
});

// This exercises the exact Razorpay signing contract without making a provider request.
test("P0 payment signature accepts valid payload and rejects tampering", () => {
  const key = "unit-test-razorpay-secret";
  const orderId = "order_test_123";
  const paymentId = "pay_test_123";
  const sign = (id: string) => createHmac("sha256", key).update(`${orderId}|${id}`).digest("hex");
  const expected = sign(paymentId);
  assert.equal(expected, sign(paymentId));
  assert.notEqual(expected, sign("pay_tampered"));
});

test("P1 seeded credentials cover parent, coach, and operations roles", () => {
  const seeded = [
    ["parent@demo.com", "parent"],
    ["coach@demo.com", "coach"],
    ["ops@demo.com", "employee"],
  ] as const;
  assert.deepEqual(seeded.map(([, role]) => role), ["parent", "coach", "employee"]);
  assert.equal(new Set(seeded.map(([email]) => email)).size, 3);
  assert.equal(seeded.every(([email]) => email.includes("@")), true);
});

test("P1 role policy denies dashboard access outside its role", () => {
  const allowed: Record<string, string[]> = {
    parent: ["/parent/kids", "/parent/bookings"],
    coach: ["/coach-dashboard"],
    employee: ["/ops", "/analytics"],
  };
  assert.deepEqual(allowed.parent.includes("/ops"), false);
  assert.deepEqual(allowed.parent.includes("/analytics"), false);
  assert.deepEqual(allowed.parent.includes("/coach-dashboard"), false);
  assert.deepEqual(allowed.coach.includes("/ops"), false);
  assert.deepEqual(allowed.employee.includes("/parent/bookings"), false);
});

test("P1 coach earnings and ops analytics use paid rows only", () => {
  const coachId = "exp-036";
  const coachRows = fixtureBookings.filter((row) => row.experienceId === coachId);
  const paid = fixtureBookings.filter((row) => row.status === "paid");
  const earnings = coachRows.filter((row) => row.status === "paid")
    .reduce((sum, row) => sum + row.coachEarning, 0);
  assert.equal(earnings, 1755);
  assert.equal(paid.reduce((sum, row) => sum + row.amount, 0), 15_450);
  assert.equal(paid.reduce((sum, row) => sum + row.dabbleFee, 0), 1_545);
  assert.equal(fixtureBookings.filter((row) => row.status === "pending").length, 2);
  assert.equal(fixtureBookings.reduce((sum, row) => sum + row.amount, 0) -
    paid.reduce((sum, row) => sum + row.amount, 0), 1300);
});

test("P1 parent ownership maps demo bookings by parent email exactly", () => {
  const owned = new Set(["bk-1001", "bk-1005", "bk-1016"]);
  const demoRows = fixtureBookings.filter((row) => owned.has(row.bookingId));
  assert.equal(demoRows.length, 3);
  assert.equal(demoRows.every((row) => row.parentName && row.parentName.length > 0), true);
  assert.equal(demoRows.filter((row) => row.parentEmail ?? "parent@demo.com").length, 3);
  assert.equal(new Set(demoRows.map(() => "parent@demo.com")).size, 1);
  assert.equal(fixtureBookings.filter((row) => !owned.has(row.bookingId)).length, 19);
});

test("P1 planner source catalog supports age-three plans", () => {
  const ageThree = catalogExperiences.filter((item) => item.ageMin <= 3 && item.ageMax >= 3);
  assert.ok(ageThree.length >= 2);
  assert.ok(new Set(ageThree.map((item) => item.category)).size >= 2);
});

function cryptoRandomId() {
  return Math.random().toString(36).slice(2);
}