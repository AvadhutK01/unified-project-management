import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

/**
 * Generates a authentication token.
 * @param payload Object containing id and email.
 * @returns Signed JWT token.
 */
export const generateToken = (payload: {
    id: string;
    email: string;
}): string => {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "1d" });
};

/**
 * Generates a password reset token.
 * @param payload Object containing email.
 * @returns Signed JWT token.
 */
export const generateResetToken = (payload: { email: string }): string => {
    return jwt.sign({ ...payload, purpose: "pwd-reset" }, env.JWT_SECRET, {
        expiresIn: "15m",
    });
};

/**
 * Verifies a password reset token.
 * @param token The JWT token to verify.
 * @returns Decoded payload containing email.
 */
export const verifyResetToken = (token: string): { email: string } => {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
        email: string;
        purpose?: string;
    };
    if (decoded.purpose !== "pwd-reset") {
        throw new Error("Invalid token purpose");
    }
    return { email: decoded.email };
};
