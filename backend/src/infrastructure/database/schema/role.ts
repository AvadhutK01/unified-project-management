import {
    pgTable,
    uuid,
    varchar,
    text,
    boolean,
    timestamp,
    unique,
} from "drizzle-orm/pg-core";
import { organizations } from "./organization.js";

export const roles = pgTable(
    "roles",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        organizationId: uuid("organization_id")
            .references(() => organizations.id)
            .notNull(),
        name: varchar("name", { length: 255 }).notNull(),
        description: text("description"),
        isActive: boolean("is_active").default(true).notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => ({
        unq: unique("roles_org_id_name_key").on(
            table.organizationId,
            table.name,
        ),
    }),
);
