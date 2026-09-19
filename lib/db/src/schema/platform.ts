import { pgTable, integer, text, timestamp } from "drizzle-orm/pg-core";
export const platformMetricsTable = pgTable("platform_metrics", {
  id: integer("id").primaryKey().default(1),
  periodLabel: text("period_label").notNull(),
  searchCount: integer("search_count").notNull().default(0),
  newParentSignups: integer("new_parent_signups").notNull().default(0),
  activeCoaches: integer("active_coaches").notNull().default(0),
  societiesLive: integer("societies_live").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});