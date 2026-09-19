import { createInsertSchema } from "drizzle-zod";
import { integer, jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { z } from "zod/v4";

export const bookingStatusEnum = pgEnum("booking_status", ["paid", "pending"]);
export const bookingsTable = pgTable("bookings", {
  id: text("id").primaryKey(),
  parentUserId: uuid("parent_user_id").references(() => usersTable.id, { onDelete: "cascade" }),
  coachId: text("coach_id").notNull(),
  slotId: text("slot_id").notNull(),
  childName: text("child_name").notNull(),
  childAge: integer("child_age").notNull(),
  parentName: text("parent_name").notNull(),
  parentEmail: text("parent_email").notNull(),
  parentPhone: text("parent_phone").notNull(),
  seats: integer("seats").notNull(),
  trialFee: integer("trial_fee").notNull(),
  serviceFee: integer("service_fee").notNull(),
  coachFee: integer("coach_fee").notNull(),
  dabbleFee: integer("dabble_fee").notNull(),
  total: integer("total").notNull(),
  amount: integer("amount").notNull(),
  coachEarning: integer("coach_earning").notNull(),
  category: text("category").notNull(),
  area: text("area").notNull(),
  status: bookingStatusEnum("status").notNull().default("paid"),
  slotDate: text("slot_date").notNull(),
  slotTime: text("slot_time").notNull(),
  coachSnapshot: jsonb("coach_snapshot").notNull(),
  slotSnapshot: jsonb("slot_snapshot").notNull(),
  paymentOrderId: text("payment_order_id"),
  paymentId: text("payment_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
export const insertBookingSchema = createInsertSchema(bookingsTable).omit({ createdAt: true });
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type BookingRecord = typeof bookingsTable.$inferSelect;