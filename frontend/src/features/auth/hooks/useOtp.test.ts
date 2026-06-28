import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect } from "vitest";
import React from "react";
import {
    useVerifyOtp,
    useResendOtp,
    useGenerateResetPasswordOtp,
    useVerifyResetPasswordOtp,
} from "./useOtp";
import * as api from "../api/auth.api";

vi.mock("../api/auth.api", () => ({
    verifyOtp: vi.fn(),
    resendOtp: vi.fn(),
    getResetPasswordOtp: vi.fn(),
    verifyResetPasswordOtp: vi.fn(),
}));

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });
    return ({ children }: { children: React.ReactNode }) =>
        React.createElement(
            QueryClientProvider,
            { client: queryClient },
            children,
        );
};

describe("useOtp Hooks", () => {
    it("useVerifyOtp mutation should call verifyOtp API", async () => {
        const wrapper = createWrapper();
        const mockResult = { success: true };
        vi.mocked(api.verifyOtp).mockResolvedValue(mockResult);

        const { result } = renderHook(() => useVerifyOtp(), { wrapper });

        result.current.mutate({
            email: "john@example.com",
            emailOtp: "123456",
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(api.verifyOtp).toHaveBeenCalledWith(
            {
                email: "john@example.com",
                emailOtp: "123456",
            },
            expect.any(Object),
        );
        expect(result.current.data).toEqual(mockResult);
    });

    it("useResendOtp mutation should call resendOtp API", async () => {
        const wrapper = createWrapper();
        const mockResult = { success: true };
        vi.mocked(api.resendOtp).mockResolvedValue(mockResult);

        const { result } = renderHook(() => useResendOtp(), { wrapper });

        result.current.mutate({
            email: "john@example.com",
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(api.resendOtp).toHaveBeenCalledWith(
            {
                email: "john@example.com",
            },
            expect.any(Object),
        );
        expect(result.current.data).toEqual(mockResult);
    });

    it("useGenerateResetPasswordOtp mutation should call getResetPasswordOtp API", async () => {
        const wrapper = createWrapper();
        const mockResult = { success: true };
        vi.mocked(api.getResetPasswordOtp).mockResolvedValue(mockResult);

        const { result } = renderHook(() => useGenerateResetPasswordOtp(), {
            wrapper,
        });

        result.current.mutate({
            email: "john@example.com",
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(api.getResetPasswordOtp).toHaveBeenCalledWith(
            {
                email: "john@example.com",
            },
            expect.any(Object),
        );
        expect(result.current.data).toEqual(mockResult);
    });

    it("useVerifyResetPasswordOtp mutation should call verifyResetPasswordOtp API", async () => {
        const wrapper = createWrapper();
        const mockResult = { token: "token123" };
        vi.mocked(api.verifyResetPasswordOtp).mockResolvedValue(mockResult);

        const { result } = renderHook(() => useVerifyResetPasswordOtp(), {
            wrapper,
        });

        result.current.mutate({
            email: "john@example.com",
            otp: "123456",
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(api.verifyResetPasswordOtp).toHaveBeenCalledWith(
            {
                email: "john@example.com",
                otp: "123456",
            },
            expect.any(Object),
        );
        expect(result.current.data).toEqual(mockResult);
    });

    it("useVerifyOtp mutation should handle API error", async () => {
        const wrapper = createWrapper();
        vi.mocked(api.verifyOtp).mockRejectedValue(new Error("API Error"));

        const { result } = renderHook(() => useVerifyOtp(), { wrapper });

        result.current.mutate({
            email: "john@example.com",
            emailOtp: "123456",
        });

        await waitFor(() => expect(result.current.isError).toBe(true));
    });

    it("useResendOtp mutation should handle API error", async () => {
        const wrapper = createWrapper();
        vi.mocked(api.resendOtp).mockRejectedValue(new Error("API Error"));

        const { result } = renderHook(() => useResendOtp(), { wrapper });

        result.current.mutate({ email: "john@example.com" });

        await waitFor(() => expect(result.current.isError).toBe(true));
    });
});
