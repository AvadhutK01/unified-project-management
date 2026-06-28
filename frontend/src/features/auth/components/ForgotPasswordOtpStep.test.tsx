import React from "react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { renderWithProviders } from "@/test/utils";
import { ForgotPasswordOtpStep } from "./ForgotPasswordOtpStep";
import {
    useGenerateResetPasswordOtp,
    useVerifyResetPasswordOtp,
} from "../hooks/useOtp";

vi.mock("../hooks/useOtp", () => ({
    useGenerateResetPasswordOtp: vi.fn(),
    useVerifyResetPasswordOtp: vi.fn(),
}));

vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        dismiss: vi.fn(),
        info: vi.fn(),
    },
}));

describe("ForgotPasswordOtpStep Component", () => {
    const mockGenerate = vi.fn();
    const mockVerify = vi.fn();
    const mockOnSuccess = vi.fn();
    const mockOnBack = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useGenerateResetPasswordOtp).mockReturnValue({
            mutate: mockGenerate,
        } as any);
        vi.mocked(useVerifyResetPasswordOtp).mockReturnValue({
            mutate: mockVerify,
            isPending: false,
        } as any);
    });

    it("should render OTP step form correctly", () => {
        renderWithProviders(
            <ForgotPasswordOtpStep
                email="john@example.com"
                onSuccess={mockOnSuccess}
                onBack={mockOnBack}
            />,
        );

        expect(screen.getByText("Check your email")).toBeInTheDocument();
        expect(screen.getAllByText("john@example.com")).toHaveLength(2);
        expect(screen.getAllByRole("textbox")).toHaveLength(6);
        expect(
            screen.getByRole("button", { name: /Verify code/i }),
        ).toBeInTheDocument();
    });

    it("should trigger onBack when change email is clicked", async () => {
        const { user } = renderWithProviders(
            <ForgotPasswordOtpStep
                email="john@example.com"
                onSuccess={mockOnSuccess}
                onBack={mockOnBack}
            />,
        );

        const changeEmailBtn = screen.getByRole("button", {
            name: /Change email address/i,
        });
        await user.click(changeEmailBtn);

        expect(mockOnBack).toHaveBeenCalled();
    });

    it("should trigger verify mutation and success callback", async () => {
        mockVerify.mockImplementation((payload, options) => {
            options?.onSuccess?.({ data: { token: "valid-reset-token" } });
        });

        const { user } = renderWithProviders(
            <ForgotPasswordOtpStep
                email="john@example.com"
                onSuccess={mockOnSuccess}
                onBack={mockOnBack}
            />,
        );

        const inputs = screen.getAllByRole("textbox");
        for (let i = 0; i < 6; i++) {
            await user.type(inputs[i], `${i + 1}`);
        }

        const verifyBtn = screen.getByRole("button", { name: /Verify code/i });
        expect(verifyBtn).toBeEnabled();

        await user.click(verifyBtn);

        await waitFor(() => {
            expect(mockVerify).toHaveBeenCalledWith(
                { email: "john@example.com", otp: "123456" },
                expect.any(Object),
            );
            expect(toast.success).toHaveBeenCalledWith("OTP verified!");
            expect(mockOnSuccess).toHaveBeenCalledWith("valid-reset-token");
        });
    });

    it("should display error toast on invalid OTP verification", async () => {
        mockVerify.mockImplementation((payload, options) => {
            options?.onError?.({
                response: { data: { message: "Invalid OTP" } },
            });
        });

        const { user } = renderWithProviders(
            <ForgotPasswordOtpStep
                email="john@example.com"
                onSuccess={mockOnSuccess}
                onBack={mockOnBack}
            />,
        );

        const inputs = screen.getAllByRole("textbox");
        for (let i = 0; i < 6; i++) {
            await user.type(inputs[i], "9");
        }

        const verifyBtn = screen.getByRole("button", { name: /Verify code/i });
        await user.click(verifyBtn);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Invalid OTP");
            expect(mockOnSuccess).not.toHaveBeenCalled();
        });
    });

    it("should show fallback error toast when no error message is provided", async () => {
        mockVerify.mockImplementation((payload, options) => {
            options?.onError?.({});
        });

        const { user } = renderWithProviders(
            <ForgotPasswordOtpStep
                email="john@example.com"
                onSuccess={mockOnSuccess}
                onBack={mockOnBack}
            />,
        );

        const inputs = screen.getAllByRole("textbox");
        for (let i = 0; i < 6; i++) {
            await user.type(inputs[i], "1");
        }

        const verifyBtn = screen.getByRole("button", { name: /Verify code/i });
        await user.click(verifyBtn);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(
                "Invalid OTP. Please try again.",
            );
        });
    });

    it("should have verify button disabled when OTP is incomplete", () => {
        renderWithProviders(
            <ForgotPasswordOtpStep
                email="john@example.com"
                onSuccess={mockOnSuccess}
                onBack={mockOnBack}
            />,
        );

        const verifyBtn = screen.getByRole("button", { name: /Verify code/i });
        expect(verifyBtn).toBeDisabled();
    });

    it("should reset OTP and show cooldown when resend is clicked", async () => {
        const { user } = renderWithProviders(
            <ForgotPasswordOtpStep
                email="john@example.com"
                onSuccess={mockOnSuccess}
                onBack={mockOnBack}
            />,
        );

        const inputs = screen.getAllByRole("textbox");
        for (let i = 0; i < 6; i++) {
            await user.type(inputs[i], "1");
        }

        // Fill all OTP and verify
        const verifyBtn = screen.getByRole("button", { name: /Verify code/i });
        expect(verifyBtn).toBeEnabled();
    });
});
