import {
    pgTable,
    uuid,
    varchar,
    boolean,
    timestamp,
    pgEnum,
} from "drizzle-orm/pg-core";
import { AUTH_PROVIDER } from "../../../shared/constants/enumConstants.js";

export const userAuthProviderEnum = pgEnum("user_auth_provider", [
    AUTH_PROVIDER.LOCAL,
    AUTH_PROVIDER.GOOGLE,
]);

export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    username: varchar("username", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    phoneNumber: varchar("phone_number", { length: 255 }).unique(),
    password: varchar("password", { length: 255 }),
    googleId: varchar("google_id", { length: 255 }).unique(),
    authProvider: userAuthProviderEnum("auth_provider")
        .default(AUTH_PROVIDER.LOCAL)
        .notNull(),
    emailOtp: varchar("email_otp", { length: 255 }),
    phoneOtp: varchar("phone_otp", { length: 255 }),
    pwdResetOtp: varchar("pwd_reset_otp", { length: 255 }),
    isVerified: boolean("is_verified").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
