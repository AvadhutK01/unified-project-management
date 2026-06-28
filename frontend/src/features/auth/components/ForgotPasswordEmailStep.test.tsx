import React from "react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { renderWithProviders } from "@/test/utils";
import { ForgotPasswordEmailStep } from "./ForgotPasswordEmailStep";
import { useGenerateResetPasswordOtp } from "../hooks/useOtp";

vi.mock("../hooks/useOtp", () => ({
    useGenerateResetPasswordOtp: vi.fn(),
}));

vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        dismiss: vi.fn(),
    },
}));

describe("ForgotPasswordEmailStep Component", () => {
    const mockMutate = vi.fn();
    const mockOnSuccess = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useGenerateResetPasswordOtp).mockReturnValue({
            mutate: mockMutate,
        } as any);
    });

    it("should render forgot password form correctly", () => {
        renderWithProviders(
            <ForgotPasswordEmailStep onSuccess={mockOnSuccess} />,
        );

        expect(screen.getByLabelText("Email address")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /Send verification code/i }),
        ).toBeInTheDocument();
    });

    it("should display validation error with invalid email input", async () => {
        const { user } = renderWithProviders(
            <ForgotPasswordEmailStep onSuccess={mockOnSuccess} />,
        );

        const emailInput = screen.getByLabelText("Email address");
        const submitBtn = screen.getByRole("button", {
            name: /Send verification code/i,
        });

        await user.type(emailInput, "abc@def");
        await user.click(submitBtn);

        await waitFor(() => {
            expect(
                screen.getByText("Please enter a valid email address"),
            ).toBeInTheDocument();
        });
        expect(mockMutate).not.toHaveBeenCalled();
    });

    it("should call mutate and trigger onSuccess callback upon successful submission", async () => {
        mockMutate.mockImplementation((payload, options) => {
            options?.onSuccess?.();
        });

        const { user } = renderWithProviders(
            <ForgotPasswordEmailStep onSuccess={mockOnSuccess} />,
        );

        const emailInput = screen.getByLabelText("Email address");
        const submitBtn = screen.getByRole("button", {
            name: /Send verification code/i,
        });

        await user.type(emailInput, "test@example.com");
        await user.click(submitBtn);

        await waitFor(() => {
            expect(mockMutate).toHaveBeenCalledWith(
                { email: "test@example.com" },
                expect.any(Object),
            );
            expect(toast.success).toHaveBeenCalledWith(
                "OTP sent!",
                expect.objectContaining({
                    description: "Check your inbox at test@example.com",
                }),
            );
            expect(mockOnSuccess).toHaveBeenCalledWith("test@example.com");
        });
    });

    it("should show error toast upon mutation failure", async () => {
        mockMutate.mockImplementation((payload, options) => {
            options?.onError?.({
                response: { data: { message: "Server error occurred" } },
            });
        });

        const { user } = renderWithProviders(
            <ForgotPasswordEmailStep onSuccess={mockOnSuccess} />,
        );

        const emailInput = screen.getByLabelText("Email address");
        const submitBtn = screen.getByRole("button", {
            name: /Send verification code/i,
        });

        await user.type(emailInput, "test@example.com");
        await user.click(submitBtn);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Server error occurred");
            expect(mockOnSuccess).not.toHaveBeenCalled();
        });
    });

    it("should show fallback error toast when no message is returned", async () => {
        mockMutate.mockImplementation((payload, options) => {
            options?.onError?.({});
        });

        const { user } = renderWithProviders(
            <ForgotPasswordEmailStep onSuccess={mockOnSuccess} />,
        );

        const emailInput = screen.getByLabelText("Email address");
        const submitBtn = screen.getByRole("button", {
            name: /Send verification code/i,
        });

        await user.type(emailInput, "test@example.com");
        await user.click(submitBtn);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(
                "Failed to send OTP. Please try again.",
            );
        });
    });

    it("should disable submit button when email is empty", async () => {
        const { user } = renderWithProviders(
            <ForgotPasswordEmailStep onSuccess={mockOnSuccess} />,
        );

        const submitBtn = screen.getByRole("button", {
            name: /Send verification code/i,
        });
        await user.click(submitBtn);

        await waitFor(() => {
            expect(mockMutate).not.toHaveBeenCalled();
        });
    });
});
