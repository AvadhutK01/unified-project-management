import React from "react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { renderWithProviders } from "@/test/utils";
import VerifyOtp from "./VerifyOtp";
import { useVerifyOtp, useResendOtp } from "../hooks/useOtp";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const original = await vi.importActual("react-router-dom");
    return {
        ...original,
        useNavigate: () => mockNavigate,
    };
});

vi.mock("../hooks/useOtp", () => ({
    useVerifyOtp: vi.fn(),
    useResendOtp: vi.fn(),
}));

vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        dismiss: vi.fn(),
    },
}));

describe("VerifyOtp Page Component", () => {
    const mockVerifyMutate = vi.fn();
    const mockResendMutate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        vi.mocked(useVerifyOtp).mockReturnValue({
            mutate: mockVerifyMutate,
            isPending: false,
        } as any);
        vi.mocked(useResendOtp).mockReturnValue({
            mutate: mockResendMutate,
            isPending: false,
        } as any);
    });

    it("should redirect to login if state (email) is missing", () => {
        renderWithProviders(<VerifyOtp />, {
            initialEntries: [{ pathname: "/verify-otp", state: null }],
        });

        expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true });
    });

    it("should render OTP fields correctly if state is provided", () => {
        renderWithProviders(<VerifyOtp />, {
            initialEntries: [
                {
                    pathname: "/verify-otp",
                    state: {
                        email: "test@example.com",
                        mobile: "+12345678901",
                    },
                },
            ],
        });

        expect(screen.getByText("Verify your account")).toBeInTheDocument();
        expect(screen.getByText("test@example.com")).toBeInTheDocument();
        expect(screen.getByText("+12345678901")).toBeInTheDocument();

        // 6 email + 6 mobile = 12 total textbox inputs
        expect(screen.getAllByRole("textbox")).toHaveLength(12);

        const verifyBtn = screen.getByRole("button", {
            name: /Verify & continue/i,
        });
        expect(verifyBtn).toBeDisabled();
    });

    it("should submit verification OTP code and navigate on success", async () => {
        mockVerifyMutate.mockImplementation((payload, options) => {
            options?.onSuccess?.({ data: { token: "user-jwt-token" } });
        });

        const { user } = renderWithProviders(<VerifyOtp />, {
            initialEntries: [
                {
                    pathname: "/verify-otp",
                    state: {
                        email: "test@example.com",
                        mobile: "+12345678901",
                    },
                },
            ],
        });

        const textboxes = screen.getAllByRole("textbox");
        // Fill first 6 for email
        for (let i = 0; i < 6; i++) {
            await user.type(textboxes[i], `${i}`);
        }
        // Fill next 6 for mobile
        for (let i = 6; i < 12; i++) {
            await user.type(textboxes[i], `${i - 6}`);
        }

        const verifyBtn = screen.getByRole("button", {
            name: /Verify & continue/i,
        });
        expect(verifyBtn).toBeEnabled();
        await user.click(verifyBtn);

        await waitFor(() => {
            expect(mockVerifyMutate).toHaveBeenCalledWith(
                {
                    email: "test@example.com",
                    phoneNumber: "+12345678901",
                    emailOtp: "012345",
                    phoneOtp: "012345",
                },
                expect.any(Object),
            );
            expect(localStorage.getItem("token")).toBe("user-jwt-token");
            expect(toast.success).toHaveBeenCalledWith(
                "Verification successful!",
            );
            expect(mockNavigate).toHaveBeenCalledWith("/org-setup");
        });
    });

    it("should show error toast on verification failure", async () => {
        mockVerifyMutate.mockImplementation((payload, options) => {
            options?.onError?.({
                response: { data: { message: "Invalid verification code" } },
            });
        });

        const { user } = renderWithProviders(<VerifyOtp />, {
            initialEntries: [
                {
                    pathname: "/verify-otp",
                    state: {
                        email: "test@example.com",
                        mobile: "+12345678901",
                    },
                },
            ],
        });

        const textboxes = screen.getAllByRole("textbox");
        for (let i = 0; i < 12; i++) {
            await user.type(textboxes[i], "1");
        }

        const verifyBtn = screen.getByRole("button", {
            name: /Verify & continue/i,
        });
        await user.click(verifyBtn);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(
                "Invalid verification code",
            );
        });
    });

    it("should show fallback error toast on verification failure without message", async () => {
        mockVerifyMutate.mockImplementation((payload, options) => {
            options?.onError?.({});
        });

        const { user } = renderWithProviders(<VerifyOtp />, {
            initialEntries: [
                {
                    pathname: "/verify-otp",
                    state: {
                        email: "test@example.com",
                        mobile: "+12345678901",
                    },
                },
            ],
        });

        const textboxes = screen.getAllByRole("textbox");
        for (let i = 0; i < 12; i++) {
            await user.type(textboxes[i], "1");
        }

        const verifyBtn = screen.getByRole("button", {
            name: /Verify & continue/i,
        });
        await user.click(verifyBtn);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(
                "Verification failed. Please try again.",
            );
        });
    });

    it("should handle resend email OTP and show cooldown toast", async () => {
        mockResendMutate.mockImplementation((payload, options) => {
            options?.onSuccess?.();
        });

        renderWithProviders(<VerifyOtp />, {
            initialEntries: [
                {
                    pathname: "/verify-otp",
                    state: {
                        email: "test@example.com",
                        mobile: "+12345678901",
                    },
                },
            ],
        });

        // Cooldown starts at 60s for both email and mobile
        expect(screen.getAllByText("60s").length).toBe(2);
    });

    it("should display verify button as disabled when OTPs are incomplete", () => {
        renderWithProviders(<VerifyOtp />, {
            initialEntries: [
                {
                    pathname: "/verify-otp",
                    state: {
                        email: "test@example.com",
                        mobile: "+12345678901",
                    },
                },
            ],
        });

        const verifyBtn = screen.getByRole("button", {
            name: /Verify & continue/i,
        });
        expect(verifyBtn).toBeDisabled();
    });

    it("should render with only email in state (mobile optional)", () => {
        renderWithProviders(<VerifyOtp />, {
            initialEntries: [
                {
                    pathname: "/verify-otp",
                    state: { email: "test@example.com" },
                },
            ],
        });

        expect(screen.getByText("test@example.com")).toBeInTheDocument();
        expect(screen.getAllByRole("textbox")).toHaveLength(12);
    });
});
