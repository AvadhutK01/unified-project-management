import {
    pgTable,
    uuid,
    varchar,
    boolean,
    timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    username: varchar("username", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    phoneNumber: varchar("phone_number", { length: 255 }).unique(),
    password: varchar("password", { length: 255 }),
    googleId: varchar("google_id", { length: 255 }).unique(),
    authProvider: varchar("auth_provider", { length: 50 })
        .default("local")
        .notNull(),
    emailOtp: varchar("email_otp", { length: 255 }),
    phoneOtp: varchar("phone_otp", { length: 255 }),
    pwdResetOtp: varchar("pwd_reset_otp", { length: 255 }),
    isVerified: boolean("is_verified").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
