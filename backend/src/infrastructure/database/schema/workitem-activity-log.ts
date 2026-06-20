import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { workitems } from "./workitem.js";
import { users } from "./user.js";

export const workitemActivityLogs = pgTable("workitem_activity_logs", {
    id: uuid("id").defaultRandom().primaryKey(),
    workitemId: uuid("workitem_id")
        .references(() => workitems.id)
        .notNull(),
    userId: uuid("user_id")
        .references(() => users.id)
        .notNull(),
    action: varchar("action", { length: 255 }).notNull(),
    description: text("description").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
