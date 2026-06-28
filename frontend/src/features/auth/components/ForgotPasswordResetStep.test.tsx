import React from "react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { renderWithProviders } from "@/test/utils";
import { ForgotPasswordResetStep } from "./ForgotPasswordResetStep";
import { useResetPassword } from "../hooks/useAuth";

vi.mock("../hooks/useAuth", () => ({
    useResetPassword: vi.fn(),
}));

vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        dismiss: vi.fn(),
    },
}));

describe("ForgotPasswordResetStep Component", () => {
    const mockResetPassword = vi.fn();
    const mockOnSuccess = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useResetPassword).mockReturnValue({
            mutate: mockResetPassword,
        } as any);
    });

    it("should render set new password form correctly", () => {
        renderWithProviders(
            <ForgotPasswordResetStep
                token="test-token"
                onSuccess={mockOnSuccess}
            />,
        );

        expect(screen.getByLabelText("New password")).toBeInTheDocument();
        expect(screen.getByLabelText("Confirm password")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /Reset password/i }),
        ).toBeInTheDocument();
    });

    it("should show strength indicator as password is typed", async () => {
        const { user } = renderWithProviders(
            <ForgotPasswordResetStep
                token="test-token"
                onSuccess={mockOnSuccess}
            />,
        );

        const passwordInput = screen.getByLabelText("New password");
        await user.type(passwordInput, "P");
        expect(screen.getByText(/Strength:/i)).toBeInTheDocument();
    });

    it("should display validation error on mismatched passwords", async () => {
        const { user } = renderWithProviders(
            <ForgotPasswordResetStep
                token="test-token"
                onSuccess={mockOnSuccess}
            />,
        );

        const passwordInput = screen.getByLabelText("New password");
        const confirmInput = screen.getByLabelText("Confirm password");
        const submitBtn = screen.getByRole("button", {
            name: /Reset password/i,
        });

        await user.type(passwordInput, "Password123");
        await user.type(confirmInput, "Different123");
        await user.click(submitBtn);

        await waitFor(() => {
            expect(
                screen.getByText("Passwords do not match"),
            ).toBeInTheDocument();
        });
        expect(mockResetPassword).not.toHaveBeenCalled();
    });

    it("should trigger mutation and onSuccess callback on success", async () => {
        mockResetPassword.mockImplementation((payload, options) => {
            options?.onSuccess?.();
        });

        const { user } = renderWithProviders(
            <ForgotPasswordResetStep
                token="test-token"
                onSuccess={mockOnSuccess}
            />,
        );

        const passwordInput = screen.getByLabelText("New password");
        const confirmInput = screen.getByLabelText("Confirm password");
        const submitBtn = screen.getByRole("button", {
            name: /Reset password/i,
        });

        await user.type(passwordInput, "Password123");
        await user.type(confirmInput, "Password123");
        await user.click(submitBtn);

        await waitFor(() => {
            expect(mockResetPassword).toHaveBeenCalledWith(
                { token: "test-token", password: "Password123" },
                expect.any(Object),
            );
            expect(toast.success).toHaveBeenCalledWith(
                "Password reset successfully!",
            );
            expect(mockOnSuccess).toHaveBeenCalled();
        });
    });

    it("should display error toast on mutation failure", async () => {
        mockResetPassword.mockImplementation((payload, options) => {
            options?.onError?.({
                response: { data: { message: "Fail reason" } },
            });
        });

        const { user } = renderWithProviders(
            <ForgotPasswordResetStep
                token="test-token"
                onSuccess={mockOnSuccess}
            />,
        );

        const passwordInput = screen.getByLabelText("New password");
        const confirmInput = screen.getByLabelText("Confirm password");
        const submitBtn = screen.getByRole("button", {
            name: /Reset password/i,
        });

        await user.type(passwordInput, "Password123");
        await user.type(confirmInput, "Password123");
        await user.click(submitBtn);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Fail reason");
            expect(mockOnSuccess).not.toHaveBeenCalled();
        });
    });

    it("should show fallback error toast when no error message provided", async () => {
        mockResetPassword.mockImplementation((payload, options) => {
            options?.onError?.({});
        });

        const { user } = renderWithProviders(
            <ForgotPasswordResetStep
                token="test-token"
                onSuccess={mockOnSuccess}
            />,
        );

        const passwordInput = screen.getByLabelText("New password");
        const confirmInput = screen.getByLabelText("Confirm password");
        const submitBtn = screen.getByRole("button", {
            name: /Reset password/i,
        });

        await user.type(passwordInput, "Password123");
        await user.type(confirmInput, "Password123");
        await user.click(submitBtn);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(
                "Failed to reset password. Please try again.",
            );
        });
    });
});
