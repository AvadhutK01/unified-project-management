import { describe, it, expect } from "vitest";
import {
    registerSchema,
    loginSchema,
    resetSchema,
    emailSchema,
} from "./auth.schema";

describe("Authentication Validation Schemas", () => {
    describe("registerSchema", () => {
        const validData = {
            fullName: "John Doe",
            email: "john@example.com",
            mobile: "+12345678901",
            password: "Password1",
            confirmPassword: "Password1",
            terms: true as const,
        };

        it("should validate successfully with correct details", () => {
            const result = registerSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it("should fail when fullName is less than 2 characters", () => {
            const result = registerSchema.safeParse({
                ...validData,
                fullName: "A",
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe(
                    "Name must be at least 2 characters",
                );
            }
        });

        it("should fail when email is invalid", () => {
            const result = registerSchema.safeParse({
                ...validData,
                email: "invalid-email",
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe(
                    "Please enter a valid email address",
                );
            }
        });

        it("should fail when mobile number format is invalid", () => {
            const result = registerSchema.safeParse({
                ...validData,
                mobile: "1234",
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe(
                    "Please enter a valid mobile number",
                );
            }
        });

        it("should fail when password has no uppercase letter", () => {
            const result = registerSchema.safeParse({
                ...validData,
                password: "password1",
                confirmPassword: "password1",
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe(
                    "Must contain at least one uppercase letter",
                );
            }
        });

        it("should fail when password has no number", () => {
            const result = registerSchema.safeParse({
                ...validData,
                password: "Password",
                confirmPassword: "Password",
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe(
                    "Must contain at least one number",
                );
            }
        });

        it("should fail when passwords do not match", () => {
            const result = registerSchema.safeParse({
                ...validData,
                confirmPassword: "DifferentPassword1",
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe(
                    "Passwords do not match",
                );
            }
        });

        it("should fail when terms are not accepted", () => {
            const result = registerSchema.safeParse({
                ...validData,
                terms: false,
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe(
                    "You must accept the terms",
                );
            }
        });

        it("should fail when fullName exceeds maximum length", () => {
            const result = registerSchema.safeParse({
                ...validData,
                fullName: "A".repeat(61),
            });
            expect(result.success).toBe(false);
        });

        it("should fail when fullName is empty", () => {
            const result = registerSchema.safeParse({
                ...validData,
                fullName: "",
            });
            expect(result.success).toBe(false);
        });

        it("should fail when email is empty", () => {
            const result = registerSchema.safeParse({
                ...validData,
                email: "",
            });
            expect(result.success).toBe(false);
        });

        it("should fail when mobile is empty", () => {
            const result = registerSchema.safeParse({
                ...validData,
                mobile: "",
            });
            expect(result.success).toBe(false);
        });

        it("should fail when mobile starts with 0", () => {
            const result = registerSchema.safeParse({
                ...validData,
                mobile: "01234567890",
            });
            expect(result.success).toBe(false);
        });

        it("should fail when password is shorter than 8 characters", () => {
            const result = registerSchema.safeParse({
                ...validData,
                password: "Pass1",
                confirmPassword: "Pass1",
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe(
                    "Password must be at least 8 characters",
                );
            }
        });
    });

    describe("loginSchema", () => {
        it("should validate successfully with correct details", () => {
            const result = loginSchema.safeParse({
                email: "test@example.com",
                password: "password123",
            });
            expect(result.success).toBe(true);
        });

        it("should fail with invalid email", () => {
            const result = loginSchema.safeParse({
                email: "invalid",
                password: "password123",
            });
            expect(result.success).toBe(false);
        });

        it("should fail with short password", () => {
            const result = loginSchema.safeParse({
                email: "test@example.com",
                password: "short",
            });
            expect(result.success).toBe(false);
        });

        it("should fail when email is empty", () => {
            const result = loginSchema.safeParse({
                email: "",
                password: "password123",
            });
            expect(result.success).toBe(false);
        });

        it("should fail when password is empty", () => {
            const result = loginSchema.safeParse({
                email: "test@example.com",
                password: "",
            });
            expect(result.success).toBe(false);
        });

        it("should fail with empty object", () => {
            const result = loginSchema.safeParse({});
            expect(result.success).toBe(false);
        });
    });

    describe("resetSchema", () => {
        it("should validate successfully when passwords match", () => {
            const result = resetSchema.safeParse({
                newPassword: "newpassword123",
                confirmPassword: "newpassword123",
            });
            expect(result.success).toBe(true);
        });

        it("should fail when passwords do not match", () => {
            const result = resetSchema.safeParse({
                newPassword: "newpassword123",
                confirmPassword: "different123",
            });
            expect(result.success).toBe(false);
        });

        it("should fail when newPassword is too short", () => {
            const result = resetSchema.safeParse({
                newPassword: "short",
                confirmPassword: "short",
            });
            expect(result.success).toBe(false);
        });

        it("should fail when both passwords are empty", () => {
            const result = resetSchema.safeParse({
                newPassword: "",
                confirmPassword: "",
            });
            expect(result.success).toBe(false);
        });
    });

    describe("emailSchema", () => {
        it("should validate successfully with valid email", () => {
            const result = emailSchema.safeParse({
                email: "valid@example.com",
            });
            expect(result.success).toBe(true);
        });

        it("should fail with invalid email", () => {
            const result = emailSchema.safeParse({
                email: "invalid-email",
            });
            expect(result.success).toBe(false);
        });

        it("should fail with empty email", () => {
            const result = emailSchema.safeParse({
                email: "",
            });
            expect(result.success).toBe(false);
        });

        it("should fail with empty object", () => {
            const result = emailSchema.safeParse({});
            expect(result.success).toBe(false);
        });
    });
});
