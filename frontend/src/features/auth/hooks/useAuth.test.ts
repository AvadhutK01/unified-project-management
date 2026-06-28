import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect } from "vitest";
import React from "react";
import { useRegisterUser, useLoginUser, useResetPassword } from "./useAuth";
import * as api from "../api/auth.api";

vi.mock("../api/auth.api", () => ({
    registerUser: vi.fn(),
    loginUser: vi.fn(),
    resetPassword: vi.fn(),
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

describe("useAuth Hooks", () => {
    it("useRegisterUser mutation should call registerUser API", async () => {
        const wrapper = createWrapper();
        const mockResult = { success: true };
        vi.mocked(api.registerUser).mockResolvedValue(mockResult);

        const { result } = renderHook(() => useRegisterUser(), { wrapper });

        result.current.mutate({
            username: "John",
            email: "john@example.com",
            phoneNumber: "+1234567890",
            password: "Password1",
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(api.registerUser).toHaveBeenCalledWith(
            {
                username: "John",
                email: "john@example.com",
                phoneNumber: "+1234567890",
                password: "Password1",
            },
            expect.any(Object),
        );
        expect(result.current.data).toEqual(mockResult);
    });

    it("useLoginUser mutation should call loginUser API", async () => {
        const wrapper = createWrapper();
        const mockResult = { token: "token123" };
        vi.mocked(api.loginUser).mockResolvedValue(mockResult);

        const { result } = renderHook(() => useLoginUser(), { wrapper });

        result.current.mutate({
            email: "john@example.com",
            password: "Password1",
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(api.loginUser).toHaveBeenCalledWith(
            {
                email: "john@example.com",
                password: "Password1",
            },
            expect.any(Object),
        );
        expect(result.current.data).toEqual(mockResult);
    });

    it("useResetPassword mutation should call resetPassword API", async () => {
        const wrapper = createWrapper();
        const mockResult = { success: true };
        vi.mocked(api.resetPassword).mockResolvedValue(mockResult);

        const { result } = renderHook(() => useResetPassword(), { wrapper });

        result.current.mutate({
            token: "reset-token",
            password: "NewPassword1",
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(api.resetPassword).toHaveBeenCalledWith(
            {
                token: "reset-token",
                password: "NewPassword1",
            },
            expect.any(Object),
        );
        expect(result.current.data).toEqual(mockResult);
    });

    it("useRegisterUser mutation should handle API error", async () => {
        const wrapper = createWrapper();
        vi.mocked(api.registerUser).mockRejectedValue(new Error("API Error"));

        const { result } = renderHook(() => useRegisterUser(), { wrapper });

        result.current.mutate({
            username: "John",
            email: "john@example.com",
            phoneNumber: "+1234567890",
            password: "Password1",
        });

        await waitFor(() => expect(result.current.isError).toBe(true));
    });

    it("useLoginUser mutation should handle API error", async () => {
        const wrapper = createWrapper();
        vi.mocked(api.loginUser).mockRejectedValue(new Error("API Error"));

        const { result } = renderHook(() => useLoginUser(), { wrapper });

        result.current.mutate({
            email: "john@example.com",
            password: "Password1",
        });

        await waitFor(() => expect(result.current.isError).toBe(true));
    });

    it("useResetPassword mutation should handle API error", async () => {
        const wrapper = createWrapper();
        vi.mocked(api.resetPassword).mockRejectedValue(new Error("API Error"));

        const { result } = renderHook(() => useResetPassword(), { wrapper });

        result.current.mutate({
            token: "reset-token",
            password: "NewPassword1",
        });

        await waitFor(() => expect(result.current.isError).toBe(true));
    });
});
