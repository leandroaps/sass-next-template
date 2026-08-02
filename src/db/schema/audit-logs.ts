import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { idColumn } from "../columns";
import { user } from "./auth";
import { organization } from "./organizations";

export const auditLog = pgTable("audit_logs", {
  ...idColumn,
  actorId: text("actor_id").references(() => user.id, {
    onDelete: "set null",
  }),
  organizationId: text("organization_id").references(() => organization.id, {
    onDelete: "cascade",
  }),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: text("entity_id"),
  payload: jsonb("payload").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
