import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  smallint,
  timestamp,
  jsonb,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const CATEGORIES = [
  "PHYSICS_GRAVITY",
  "ATMOSPHERE_WEATHER",
  "FLORA_FAUNA",
  "HUMAN_BIOLOGY",
  "TEMPORAL_MECHANICS",
  "PLANETARY_INFRASTRUCTURE",
  "EXISTENTIAL_METAGAME",
] as const;

export type ComplaintCategory = (typeof CATEGORIES)[number];

export const COMPLAINT_STATUSES = [
  "PENDING_REVIEW",
  "UNDER_INVESTIGATION",
  "RESOLVED",
  "DISMISSED",
  "CANONIZED",
] as const;

export type ComplaintStatus = (typeof COMPLAINT_STATUSES)[number];

export const MODERATOR_ROLES = ["ADMIN", "MODERATOR"] as const;
export type ModeratorRole = (typeof MODERATOR_ROLES)[number];

export const REPORT_REASONS = [
  "NOT_A_PLANETARY_BUG",
  "PROFANITY_OR_HARASSMENT",
  "REAL_WORLD_POLITICS",
  "SPAM_OR_DUPLICATE",
  "ILLEGAL_CONTENT",
] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export const REPORT_STATUSES = ["PENDING", "REVIEWED", "DISMISSED"] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

// 1. Complaints Table
export const complaints = pgTable(
  "complaints",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    caseNumber: varchar("case_number", { length: 32 }).notNull().unique(),
    title: varchar("title", { length: 180 }).notNull(),
    description: text("description").notNull(),
    category: varchar("category", { length: 64 }).notNull(),
    authorName: varchar("author_name", { length: 60 }),
    isAnonymous: boolean("is_anonymous").default(true).notNull(),
    status: varchar("status", { length: 32 }).default("PENDING_REVIEW").notNull(),
    verdict: text("verdict"),
    verdictBy: varchar("verdict_by", { length: 100 }),
    verdictDate: timestamp("verdict_date", { withTimezone: true }),
    upvotesCount: integer("upvotes_count").default(0).notNull(),
    downvotesCount: integer("downvotes_count").default(0).notNull(),
    score: integer("score").default(0).notNull(),
    reportCount: integer("report_count").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_complaints_case_number").on(table.caseNumber),
    index("idx_complaints_status").on(table.status),
    index("idx_complaints_category").on(table.category),
    index("idx_complaints_score").on(table.score),
    index("idx_complaints_created_at").on(table.createdAt),
  ]
);

// 2. Votes Table (Enforces unique voter hash per complaint)
export const votes = pgTable(
  "votes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    complaintId: uuid("complaint_id")
      .references(() => complaints.id, { onDelete: "cascade" })
      .notNull(),
    voterHash: varchar("voter_hash", { length: 64 }).notNull(),
    voteType: smallint("vote_type").notNull(), // +1 or -1
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique("unique_complaint_voter").on(table.complaintId, table.voterHash),
    index("idx_votes_complaint").on(table.complaintId),
  ]
);

// 3. Citizen Reports Table
export const reports = pgTable(
  "reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    complaintId: uuid("complaint_id")
      .references(() => complaints.id, { onDelete: "cascade" })
      .notNull(),
    reason: varchar("reason", { length: 64 }).notNull(),
    details: text("details"),
    reporterHash: varchar("reporter_hash", { length: 64 }).notNull(),
    status: varchar("status", { length: 32 }).default("PENDING").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_reports_complaint").on(table.complaintId),
    index("idx_reports_status").on(table.status),
  ]
);

// 4. Moderators Table
export const moderators = pgTable(
  "moderators",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    username: varchar("username", { length: 50 }).notNull().unique(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    role: varchar("role", { length: 32 }).default("MODERATOR").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  },
  (table) => [index("idx_moderators_username").on(table.username)]
);

// 5. Moderator Sessions Table
export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),
    moderatorId: uuid("moderator_id")
      .references(() => moderators.id, { onDelete: "cascade" })
      .notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_sessions_token_hash").on(table.tokenHash),
    index("idx_sessions_expires_at").on(table.expiresAt),
  ]
);

// 6. Audit Logs Table
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    moderatorId: uuid("moderator_id").references(() => moderators.id, {
      onDelete: "set null",
    }),
    action: varchar("action", { length: 64 }).notNull(),
    targetType: varchar("target_type", { length: 32 }).notNull(),
    targetId: varchar("target_id", { length: 64 }).notNull(),
    details: jsonb("details"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("idx_audit_logs_created_at").on(table.createdAt)]
);

// Relational Definitions
export const complaintsRelations = relations(complaints, ({ many }) => ({
  votes: many(votes),
  reports: many(reports),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  complaint: one(complaints, {
    fields: [votes.complaintId],
    references: [complaints.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  complaint: one(complaints, {
    fields: [reports.complaintId],
    references: [complaints.id],
  }),
}));

export const moderatorsRelations = relations(moderators, ({ many }) => ({
  sessions: many(sessions),
  auditLogs: many(auditLogs),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  moderator: one(moderators, {
    fields: [sessions.moderatorId],
    references: [moderators.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  moderator: one(moderators, {
    fields: [auditLogs.moderatorId],
    references: [moderators.id],
  }),
}));
