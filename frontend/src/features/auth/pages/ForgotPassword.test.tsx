import React from "react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { renderWithProviders } from "@/test/utils";
import ForgotPassword from "./ForgotPassword";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const original = await vi.importActual("react-router-dom");
    return {
        ...original,
        useNavigate: () => mockNavigate,
    };
});

vi.mock("../components/ForgotPasswordEmailStep", () => ({
    ForgotPasswordEmailStep: ({ onSuccess }: any) => (
        <div>
            <span>Email Step Mock</span>
            <button onClick={() => onSuccess("john@example.com")}>
                Submit Email
            </button>
        </div>
    ),
}));

vi.mock("../components/ForgotPasswordOtpStep", () => ({
    ForgotPasswordOtpStep: ({ email, onSuccess, onBack }: any) => (
        <div>
            <span>OTP Step Mock for {email}</span>
            <button onClick={() => onSuccess("fake-reset-token")}>
                Verify OTP
            </button>
            <button onClick={onBack}>Back</button>
        </div>
    ),
}));

vi.mock("../components/ForgotPasswordResetStep", () => ({
    ForgotPasswordResetStep: ({ token, onSuccess }: any) => (
        <div>
            <span>Reset Step Mock for {token}</span>
            <button onClick={onSuccess}>Reset Success</button>
        </div>
    ),
}));

vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
    },
}));

describe("ForgotPassword Page Component Flow", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should navigate through the entire password reset wizard step-by-step", async () => {
        const { user } = renderWithProviders(<ForgotPassword />);

        // Step 1: Enter email step
        expect(screen.getByText("Email Step Mock")).toBeInTheDocument();
        const submitEmailBtn = screen.getByRole("button", {
            name: /Submit Email/i,
        });
        await user.click(submitEmailBtn);

        // Step 2: Verify code step
        await waitFor(() => {
            expect(
                screen.getByText("OTP Step Mock for john@example.com"),
            ).toBeInTheDocument();
        });

        // Test going back
        const backBtn = screen.getByRole("button", { name: /Back/i });
        await user.click(backBtn);

        // Back to step 1
        await waitFor(() => {
            expect(screen.getByText("Email Step Mock")).toBeInTheDocument();
        });

        // Submit again
        await user.click(screen.getByRole("button", { name: /Submit Email/i }));

        // Back to step 2, now submit OTP
        await waitFor(() => {
            expect(
                screen.getByText("OTP Step Mock for john@example.com"),
            ).toBeInTheDocument();
        });

        const verifyOtpBtn = screen.getByRole("button", {
            name: /Verify OTP/i,
        });
        await user.click(verifyOtpBtn);

        // Step 3: Reset password step
        await waitFor(() => {
            expect(
                screen.getByText("Reset Step Mock for fake-reset-token"),
            ).toBeInTheDocument();
        });

        const resetSuccessBtn = screen.getByRole("button", {
            name: /Reset Success/i,
        });
        await user.click(resetSuccessBtn);

        // Redirects and success toast
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/login");
            expect(toast.success).toHaveBeenCalledWith(
                "Password updated! Please sign in with your new password.",
            );
        });
    });

    it("should start at step 1 (email step) by default", () => {
        renderWithProviders(<ForgotPassword />);

        expect(screen.getByText("Email Step Mock")).toBeInTheDocument();
        expect(screen.queryByText("OTP Step Mock")).not.toBeInTheDocument();
        expect(screen.queryByText("Reset Step Mock")).not.toBeInTheDocument();
    });

    it("should render step indicator with 3 steps", () => {
        renderWithProviders(<ForgotPassword />);

        expect(screen.getByText("1")).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
    });
});
