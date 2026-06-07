import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const organizations = pgTable("organizations", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    logoUrl: varchar("logo_url", { length: 1000 }),
    ownerUserId: uuid("owner_user_id").notNull(),
    websiteUrl: varchar("website_url", { length: 1000 }),
    description: text("description"),
    status: varchar("status", { length: 50 }).default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
