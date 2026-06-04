import { describe, it, expect } from "vitest";
import {
    registerUser,
    verifyOtp,
    resendOtp,
    loginUser,
} from "../src/modules/users/application/user.use-cases.js";

describe("User Flow Integration Tests", () => {
    const uniqueId = Date.now();
    const username = `testuser_${uniqueId}`;
    const email = `testuser_${uniqueId}@example.com`;
    const phoneNumber = `9999${String(uniqueId).slice(-6)}`;
    const password = "Password@123";

    it("should register a user with pending verification", async () => {
        const result = await registerUser({
            username,
            email,
            phoneNumber,
            password,
        });

        expect(result.username).toBe(username);
        expect(result.email).toBe(email);
        expect(result.phoneNumber).toBe(phoneNumber);
        expect(result.isVerified).toBe(false);
        expect(result.emailOtp).toBe("123456");
        expect(result.phoneOtp).toBe("123456");
    });

    it("should reject login for unverified user but trigger OTP", async () => {
        const result = await loginUser({
            email,
            password,
        });

        expect(result.isVerified).toBe(false);
        expect(result.token).toBeUndefined();
    });

    it("should fail to verify user if OTP is incorrect", async () => {
        await expect(
            verifyOtp({
                email,
                phoneNumber,
                emailOtp: "111111",
                phoneOtp: "222222",
            }),
        ).rejects.toThrow();
    });

    it("should resend OTP correctly", async () => {
        const result = await resendOtp({
            email,
        });

        expect(result.email).toBe(email);
        expect(result.emailOtp).toBe("123456");
    });

    it("should verify user when both OTPs are correct and return a token", async () => {
        const result = await verifyOtp({
            email,
            phoneNumber,
            emailOtp: "123456",
            phoneOtp: "123456",
        });

        expect(result.isVerified).toBe(true);
        expect(result.token).toBeTypeOf("string");
    });

    it("should successfully login a verified user and return a token", async () => {
        const result = await loginUser({
            email,
            password,
        });

        expect(result.isVerified).toBe(true);
        expect(result.token).toBeTypeOf("string");
        expect(result.email).toBe(email);
    });

    it("should fail to register a user with already verified email/phone", async () => {
        await expect(
            registerUser({
                username: "different",
                email,
                phoneNumber,
                password,
            }),
        ).rejects.toThrow();
    });

    it("should validate and reject invalid email, phone, OTP, or simple password", async () => {
        const { registerSchema, verifyOtpSchema, loginSchema } =
            await import("../src/modules/users/presentation/user.validation.js");

        const registerEmailResult = await registerSchema.safeParseAsync({
            body: {
                username: "test",
                email: "invalid",
                password,
                phoneNumber: "9999999999",
            },
        });
        expect(registerEmailResult.success).toBe(false);

        const registerPasswordResult = await registerSchema.safeParseAsync({
            body: {
                username: "test",
                email: "test@example.com",
                password: "password123",
                phoneNumber: "9999999999",
            },
        });
        expect(registerPasswordResult.success).toBe(false);

        const registerShortPasswordResult = await registerSchema.safeParseAsync(
            {
                body: {
                    username: "test",
                    email: "test@example.com",
                    password: "Pas@12",
                    phoneNumber: "9999999999",
                },
            },
        );
        expect(registerShortPasswordResult.success).toBe(false);

        const verifyOtpResult = await verifyOtpSchema.safeParseAsync({
            body: {
                email: "test@example.com",
                phoneNumber: "9999999999",
                emailOtp: "123",
                phoneOtp: "123456",
            },
        });
        expect(verifyOtpResult.success).toBe(false);

        const loginEmailResult = await loginSchema.safeParseAsync({
            body: { email: "invalid-email", password },
        });
        expect(loginEmailResult.success).toBe(false);

        const validResult = await registerSchema.safeParseAsync({
            body: {
                username: "test",
                email: "test@example.com",
                password,
                phoneNumber: "9999999999",
            },
        });
        expect(validResult.success).toBe(true);
    });

    it("should fail to login an unregistered user", async () => {
        await expect(
            loginUser({
                email: "unregistered@example.com",
                password: "Password@123",
            }),
        ).rejects.toThrow("User is not registered");
    });

    it("should fail to register if phone number belongs to another unverified user", async () => {
        const unique = Date.now() + 10;
        const emailA = `usera_${unique}@example.com`;
        const emailB = `userb_${unique}@example.com`;
        const phoneA = `8888${String(unique).slice(-6)}`;
        const phoneB = `7777${String(unique).slice(-6)}`;

        await registerUser({
            username: "usera",
            email: emailA,
            phoneNumber: phoneA,
            password: "Password@123",
        });

        await registerUser({
            username: "userb",
            email: emailB,
            phoneNumber: phoneB,
            password: "Password@123",
        });

        await expect(
            registerUser({
                username: "usera_updated",
                email: emailA,
                phoneNumber: phoneB,
                password: "NewPassword@123",
            }),
        ).rejects.toThrow("Phone number already exists");
    });

    it("should fail to verify OTP if email and phone belong to different users", async () => {
        const unique = Date.now() + 20;
        const emailC = `userc_${unique}@example.com`;
        const phoneC = `6666${String(unique).slice(-6)}`;

        await registerUser({
            username: "userc",
            email: emailC,
            phoneNumber: phoneC,
            password: "Password@123",
        });

        await expect(
            verifyOtp({
                email: emailC,
                phoneNumber: "9999999999",
                emailOtp: "123456",
                phoneOtp: "123456",
            }),
        ).rejects.toThrow(
            "User not found with provided email and phone number",
        );
    });

    it("should fail to resend OTP if email and phone do not match", async () => {
        const unique = Date.now() + 30;
        const emailD = `userd_${unique}@example.com`;
        const phoneD = `5555${String(unique).slice(-6)}`;

        await registerUser({
            username: "userd",
            email: emailD,
            phoneNumber: phoneD,
            password: "Password@123",
        });

        await expect(
            resendOtp({
                email: emailD,
                phoneNumber: "9999999999",
            }),
        ).rejects.toThrow("Email and phone number do not match");
    });
});
