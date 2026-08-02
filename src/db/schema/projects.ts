import { pgTable, text, unique } from "drizzle-orm/pg-core";

import { idColumn, timestampColumns } from "../columns";
import { user } from "./auth";
import { organization } from "./organizations";

export const project = pgTable(
  "projects",
  {
    ...idColumn,
    name: text("name").notNull(),
    description: text("description"),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    createdById: text("created_by_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    ...timestampColumns,
  },
  (table) => [unique().on(table.organizationId, table.name)],
);
