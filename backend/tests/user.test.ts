import { describe, it, expect } from "vitest";
import {
    registerUser,
    verifyOtp,
    resendOtp,
    loginUser,
    generateResetPwdOtp,
    verifyPwdResetOtp,
    resetPassword,
    googleAuthUser,
    sendPhoneOtp,
    verifyPhoneOtp,
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

    it("should successfully generate a password reset OTP for a verified user", async () => {
        const unique = Date.now() + 40;
        const emailE = `usere_${unique}@example.com`;
        const phoneE = `4444${String(unique).slice(-6)}`;

        await registerUser({
            username: "usere",
            email: emailE,
            phoneNumber: phoneE,
            password: "Password@123",
        });

        await verifyOtp({
            email: emailE,
            phoneNumber: phoneE,
            emailOtp: "123456",
            phoneOtp: "123456",
        });

        const result = await generateResetPwdOtp(emailE);
        expect(result.email).toBe(emailE);
        expect(result.pwdResetOtp).toBe("123456");
    });

    it("should fail to generate reset OTP for an unverified user", async () => {
        const unique = Date.now() + 50;
        const emailF = `userf_${unique}@example.com`;
        const phoneF = `3333${String(unique).slice(-6)}`;

        await registerUser({
            username: "userf",
            email: emailF,
            phoneNumber: phoneF,
            password: "Password@123",
        });

        await expect(generateResetPwdOtp(emailF)).rejects.toThrow(
            "User is not verified",
        );
    });

    it("should fail to verify password reset OTP with an invalid OTP", async () => {
        const unique = Date.now() + 60;
        const emailG = `userg_${unique}@example.com`;
        const phoneG = `2222${String(unique).slice(-6)}`;

        await registerUser({
            username: "userg",
            email: emailG,
            phoneNumber: phoneG,
            password: "Password@123",
        });

        await verifyOtp({
            email: emailG,
            phoneNumber: phoneG,
            emailOtp: "123456",
            phoneOtp: "123456",
        });

        await generateResetPwdOtp(emailG);

        await expect(
            verifyPwdResetOtp({
                email: emailG,
                otp: "999999",
            }),
        ).rejects.toThrow("Invalid OTP");
    });

    it("should successfully verify OTP, get token, and reset password", async () => {
        const unique = Date.now() + 70;
        const emailH = `userh_${unique}@example.com`;
        const phoneH = `1111${String(unique).slice(-6)}`;

        await registerUser({
            username: "userh",
            email: emailH,
            phoneNumber: phoneH,
            password: "Password@123",
        });

        await verifyOtp({
            email: emailH,
            phoneNumber: phoneH,
            emailOtp: "123456",
            phoneOtp: "123456",
        });

        await generateResetPwdOtp(emailH);

        const verifyResult = await verifyPwdResetOtp({
            email: emailH,
            otp: "123456",
        });

        expect(verifyResult.token).toBeDefined();

        const result = await resetPassword({
            token: verifyResult.token,
            password: "NewPassword@123",
        });

        expect(result!.id).toBeDefined();

        const loginResult = await loginUser({
            email: emailH,
            password: "NewPassword@123",
        });
        expect(loginResult.isVerified).toBe(true);
    });

    it("should reject invalid forget/reset schemas", async () => {
        const {
            generateResetPwdOtpSchema,
            verifyResetPwdOtpSchema,
            resetPasswordSchema,
        } =
            await import("../src/modules/users/presentation/user.validation.js");

        const forgotResult = await generateResetPwdOtpSchema.safeParseAsync({
            body: { email: "invalid" },
        });
        expect(forgotResult.success).toBe(false);

        const verifyResult = await verifyResetPwdOtpSchema.safeParseAsync({
            body: { email: "invalid", otp: "123" },
        });
        expect(verifyResult.success).toBe(false);

        const resetResult = await resetPasswordSchema.safeParseAsync({
            body: { token: "", password: "pwd" },
        });
        expect(resetResult.success).toBe(false);
    });

    it("should handle Google SSO flow: new user -> phone required -> send phone OTP -> verify phone OTP -> verified", async () => {
        const unique = Date.now() + 100;
        const googleEmail = `google_user_${unique}@example.com`;
        const mockToken = `mock-google-token_${googleEmail}`;
        const phone = `1234${String(unique).slice(-6)}`;

        // 1. First Google SSO login should return requiresPhone: true
        const ssoResult = await googleAuthUser({ idToken: mockToken });
        expect(ssoResult.isVerified).toBe(false);
        expect(ssoResult.requiresPhone).toBe(true);
        expect(ssoResult.email).toBe(googleEmail);

        // 2. Send Phone OTP
        const sendOtpResult = await sendPhoneOtp({
            email: googleEmail,
            phoneNumber: phone,
        });
        expect(sendOtpResult.email).toBe(googleEmail);
        expect(sendOtpResult.phoneNumber).toBe(phone);
        expect(sendOtpResult.phoneOtp).toBe("123456");

        // 3. Verify Phone OTP
        const verifyResult = await verifyPhoneOtp({
            email: googleEmail,
            phoneNumber: phone,
            phoneOtp: "123456",
        });
        expect(verifyResult.isVerified).toBe(true);
        expect(verifyResult.token).toBeTypeOf("string");
        expect(verifyResult.phoneNumber).toBe(phone);

        // 4. Subsequent Google SSO login for verified user returns token directly
        const secondSsoResult = await googleAuthUser({ idToken: mockToken });
        expect(secondSsoResult.isVerified).toBe(true);
        expect(secondSsoResult.requiresPhone).toBe(false);
        expect(secondSsoResult.token).toBeTypeOf("string");
    });
});
