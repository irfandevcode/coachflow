import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const auditSubmissions = mysqlTable("audit_submissions", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  website: varchar("website", { length: 500 }),
  niche: varchar("niche", { length: 180 }),
  offer: text("offer"),
  price: varchar("price", { length: 100 }),
  monthlyLeads: varchar("monthlyLeads", { length: 100 }),
  bookedCalls: varchar("bookedCalls", { length: 100 }),
  leadSource: varchar("leadSource", { length: 100 }),
  challenge: varchar("challenge", { length: 100 }),
  overallScore: int("overallScore").notNull(),
  categoryScores: text("categoryScores").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditSubmission = typeof auditSubmissions.$inferSelect;
export type InsertAuditSubmission = typeof auditSubmissions.$inferInsert;
