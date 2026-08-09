import { db } from "../../../infrastructure/database/client.js";
import { users } from "../../../infrastructure/database/schema/index.js";
import { eq, or } from "drizzle-orm";

/**
 * Creates a new user in the database.
 * @param data User input data including username, email, phone number, password, and OTPs.
 * @returns The newly created user object.
 */
export const createUser = async (data: {
    username: string;
    email: string;
    phoneNumber?: string | null;
    password?: string | null;
    googleId?: string | null;
    authProvider?: string;
    emailOtp?: string | null;
    phoneOtp?: string | null;
    isVerified?: boolean;
}) => {
    const [user] = await db
        .insert(users)
        .values({
            username: data.username,
            email: data.email,
            phoneNumber: data.phoneNumber ?? null,
            password: data.password ?? null,
            googleId: data.googleId ?? null,
            authProvider: data.authProvider ?? "local",
            emailOtp: data.emailOtp ?? null,
            phoneOtp: data.phoneOtp ?? null,
            isVerified: data.isVerified ?? false,
        })
        .returning();
    return user;
};

/**
 * Finds a user by Google ID.
 * @param googleId The Google user ID.
 * @returns The user object if found, otherwise null.
 */
export const findUserByGoogleId = async (googleId: string) => {
    const results = await db
        .select()
        .from(users)
        .where(eq(users.googleId, googleId))
        .limit(1);
    return results[0] || null;
};

/**
 * Finds a user by email or phone number.
 * @param email The user email.
 * @param phoneNumber The user phone number.
 * @returns The user object if found, otherwise null.
 */
export const findUserByEmailOrPhone = async (
    email: string,
    phoneNumber: string,
) => {
    const results = await db
        .select()
        .from(users)
        .where(or(eq(users.email, email), eq(users.phoneNumber, phoneNumber)))
        .limit(1);
    return results[0] || null;
};

/**
 * Finds a user by email.
 * @param email The user email.
 * @returns The user object if found, otherwise null.
 */
export const findUserByEmail = async (email: string) => {
    const results = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
    return results[0] || null;
};

/**
 * Finds a user by phone number.
 * @param phoneNumber The user phone number.
 * @returns The user object if found, otherwise null.
 */
export const findUserByPhone = async (phoneNumber: string) => {
    const results = await db
        .select()
        .from(users)
        .where(eq(users.phoneNumber, phoneNumber))
        .limit(1);
    return results[0] || null;
};

/**
 * Finds a user by ID.
 * @param id The user UUID.
 * @returns The user object if found, otherwise null.
 */
export const findUserById = async (id: string) => {
    const results = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
    return results[0] || null;
};

/**
 * Updates a user's verification OTPs or details.
 * @param id The user ID.
 * @param otps The partial values to update.
 * @returns The updated user object.
 */
export const updateUserOtp = async (
    id: string,
    otps: {
        username?: string;
        email?: string;
        phoneNumber?: string | null;
        password?: string | null;
        googleId?: string | null;
        authProvider?: string;
        emailOtp?: string | null;
        phoneOtp?: string | null;
        pwdResetOtp?: string | null;
        isVerified?: boolean;
    },
) => {
    const [user] = await db
        .update(users)
        .set({
            ...otps,
            updatedAt: new Date(),
        })
        .where(eq(users.id, id))
        .returning();
    return user;
};

/**
 * Marks a user as verified and clears active OTP values.
 * @param id The user ID.
 * @returns The verified user object.
 */
export const markUserAsVerified = async (id: string) => {
    const [user] = await db
        .update(users)
        .set({
            isVerified: true,
            emailOtp: null,
            phoneOtp: null,
            updatedAt: new Date(),
        })
        .where(eq(users.id, id))
        .returning();
    return user;
};

/**
 * Deletes a user by their ID.
 * @param id The user ID.
 * @returns The deleted user record, or null.
 */
export const deleteUserById = async (id: string) => {
    const [user] = await db.delete(users).where(eq(users.id, id)).returning();
    return user || null;
};
