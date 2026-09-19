import { createInsertSchema } from "drizzle-zod";
import { check, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { usersTable } from "./users";
import { z } from "zod/v4";

export const kidProfilesTable = pgTable("kid_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  parentUserId: uuid("parent_user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [check("kid_age_min", sql`${table.age} >= 4`)]);
export const insertKidProfileSchema = createInsertSchema(kidProfilesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertKidProfile = z.infer<typeof insertKidProfileSchema>;
export type KidProfile = typeof kidProfilesTable.$inferSelect;