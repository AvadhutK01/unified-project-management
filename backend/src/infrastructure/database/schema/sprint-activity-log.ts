import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { sprints } from "./sprint.js";
import { users } from "./user.js";

export const sprintActivityLogs = pgTable("sprint_activity_logs", {
    id: uuid("id").defaultRandom().primaryKey(),
    sprintId: uuid("sprint_id")
        .references(() => sprints.id, { onDelete: "cascade" })
        .notNull(),
    userId: uuid("user_id")
        .references(() => users.id)
        .notNull(),
    action: varchar("action", { length: 50 }).notNull(),
    description: text("description").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
