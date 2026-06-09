import {
    pgTable,
    uuid,
    varchar,
    text,
    boolean,
    timestamp,
} from "drizzle-orm/pg-core";

export const permissions = pgTable("permissions", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    codename: varchar("codename", { length: 255 }).notNull().unique(),
    description: text("description"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
