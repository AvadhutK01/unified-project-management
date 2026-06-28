import { vi, describe, it, expect, beforeEach } from "vitest";
import { api } from "@/lib/axios";
import {
    verifyOtp,
    resendOtp,
    registerUser,
    loginUser,
    getResetPasswordOtp,
    verifyResetPasswordOtp,
    resetPassword,
} from "./auth.api";

vi.mock("@/lib/axios", () => {
    return {
        api: {
            post: vi.fn(),
        },
    };
});

describe("Authentication API Functions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("verifyOtp should post to /users/verify with payload", async () => {
        const payload = { email: "test@example.com", emailOtp: "123456" };
        const mockData = { success: true };
        vi.mocked(api.post).mockResolvedValueOnce({ data: mockData });

        const result = await verifyOtp(payload);

        expect(api.post).toHaveBeenCalledWith("/users/verify", payload);
        expect(result).toEqual(mockData);
    });

    it("verifyOtp should allow optional fields (emailOtp/phoneOtp)", async () => {
        const payload = { email: "test@example.com" };
        const mockData = { success: true };
        vi.mocked(api.post).mockResolvedValueOnce({ data: mockData });

        const result = await verifyOtp(payload);

        expect(api.post).toHaveBeenCalledWith("/users/verify", payload);
        expect(result).toEqual(mockData);
    });

    it("verifyOtp should throw on API error", async () => {
        const error = new Error("Network error");
        vi.mocked(api.post).mockRejectedValueOnce(error);

        await expect(
            verifyOtp({ email: "test@example.com", emailOtp: "123456" }),
        ).rejects.toThrow("Network error");
    });

    it("resendOtp should post to /users/resend with payload", async () => {
        const payload = { email: "test@example.com" };
        const mockData = { success: true };
        vi.mocked(api.post).mockResolvedValueOnce({ data: mockData });

        const result = await resendOtp(payload);

        expect(api.post).toHaveBeenCalledWith("/users/resend", payload);
        expect(result).toEqual(mockData);
    });

    it("resendOtp should work with phoneNumber only", async () => {
        const payload = { phoneNumber: "+1234567890" };
        const mockData = { success: true };
        vi.mocked(api.post).mockResolvedValueOnce({ data: mockData });

        const result = await resendOtp(payload);

        expect(api.post).toHaveBeenCalledWith("/users/resend", payload);
        expect(result).toEqual(mockData);
    });

    it("registerUser should post to /users/register with payload", async () => {
        const payload = {
            username: "John Doe",
            email: "john@example.com",
            phoneNumber: "+1234567890",
            password: "Password123",
        };
        const mockData = { success: true, id: "1" };
        vi.mocked(api.post).mockResolvedValueOnce({ data: mockData });

        const result = await registerUser(payload);

        expect(api.post).toHaveBeenCalledWith("/users/register", payload);
        expect(result).toEqual(mockData);
    });

    it("registerUser should throw on API error", async () => {
        const error = new Error("Network error");
        vi.mocked(api.post).mockRejectedValueOnce(error);

        await expect(
            registerUser({
                username: "John Doe",
                email: "john@example.com",
                phoneNumber: "+1234567890",
                password: "Password123",
            }),
        ).rejects.toThrow("Network error");
    });

    it("loginUser should post to /users/login with payload", async () => {
        const payload = { email: "john@example.com", password: "Password123" };
        const mockData = { token: "fake-jwt-token" };
        vi.mocked(api.post).mockResolvedValueOnce({ data: mockData });

        const result = await loginUser(payload);

        expect(api.post).toHaveBeenCalledWith("/users/login", payload);
        expect(result).toEqual(mockData);
    });

    it("loginUser should throw on API error", async () => {
        const error = new Error("Network error");
        vi.mocked(api.post).mockRejectedValueOnce(error);

        await expect(
            loginUser({ email: "john@example.com", password: "Password123" }),
        ).rejects.toThrow("Network error");
    });

    it("getResetPasswordOtp should post to /users/generate-reset-pwd-otp", async () => {
        const payload = { email: "john@example.com" };
        const mockData = { message: "OTP sent" };
        vi.mocked(api.post).mockResolvedValueOnce({ data: mockData });

        const result = await getResetPasswordOtp(payload);

        expect(api.post).toHaveBeenCalledWith(
            "/users/generate-reset-pwd-otp",
            payload,
        );
        expect(result).toEqual(mockData);
    });

    it("verifyResetPasswordOtp should post to /users/verify-reset-pwd-otp", async () => {
        const payload = { email: "john@example.com", otp: "123456" };
        const mockData = { token: "reset-token" };
        vi.mocked(api.post).mockResolvedValueOnce({ data: mockData });

        const result = await verifyResetPasswordOtp(payload);

        expect(api.post).toHaveBeenCalledWith(
            "/users/verify-reset-pwd-otp",
            payload,
        );
        expect(result).toEqual(mockData);
    });

    it("resetPassword should post to /users/reset-password", async () => {
        const payload = { token: "reset-token", password: "NewPassword123" };
        const mockData = { success: true };
        vi.mocked(api.post).mockResolvedValueOnce({ data: mockData });

        const result = await resetPassword(payload);

        expect(api.post).toHaveBeenCalledWith("/users/reset-password", payload);
        expect(result).toEqual(mockData);
    });
});
