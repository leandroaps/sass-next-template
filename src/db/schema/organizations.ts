import { pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";

import { timestampColumns } from "../columns";
import { user } from "./auth";

export const organization = pgTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logo: text("logo"),
  metadata: text("metadata"),
  ...timestampColumns,
});

export const membershipRoleValues = ["owner", "admin", "member"] as const;
export type MembershipRole = (typeof membershipRoleValues)[number];

export const membership = pgTable(
  "memberships",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role", { enum: membershipRoleValues })
      .notNull()
      .default("member"),
    ...timestampColumns,
  },
  (table) => [unique().on(table.organizationId, table.userId)],
);

export const invitation = pgTable("invitations", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role", { enum: membershipRoleValues })
    .notNull()
    .default("member"),
  status: text("status", {
    enum: ["pending", "accepted", "rejected", "canceled"],
  })
    .notNull()
    .default("pending"),
  inviterId: text("inviter_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
