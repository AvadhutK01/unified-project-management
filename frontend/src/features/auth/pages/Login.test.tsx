import React from "react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { renderWithProviders } from "@/test/utils";
import Login from "./Login";
import { useLoginUser } from "../hooks/useAuth";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const original = await vi.importActual("react-router-dom");
    return {
        ...original,
        useNavigate: () => mockNavigate,
    };
});

vi.mock("../hooks/useAuth", () => ({
    useLoginUser: vi.fn(),
    useGoogleAuth: vi
        .fn()
        .mockReturnValue({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        dismiss: vi.fn(),
    },
}));

describe("Login Page Component", () => {
    const mockLoginMutate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        vi.mocked(useLoginUser).mockReturnValue({
            mutate: mockLoginMutate,
            isPending: false,
        } as any);
    });

    it("should render login form correctly", () => {
        renderWithProviders(<Login />);

        expect(screen.getByLabelText("Email address")).toBeInTheDocument();
        expect(screen.getByLabelText("Password")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /Sign in/i }),
        ).toBeInTheDocument();
        expect(screen.getByText("Create account")).toBeInTheDocument();
    });

    it("should toggle password visibility on clicking eye icon", async () => {
        const { user } = renderWithProviders(<Login />);

        const passwordInput = screen.getByLabelText("Password");
        const toggleBtn = screen.getByRole("button", {
            name: /Show password/i,
        });

        expect(passwordInput).toHaveAttribute("type", "password");

        await user.click(toggleBtn);
        expect(passwordInput).toHaveAttribute("type", "text");

        await user.click(
            screen.getByRole("button", { name: /Hide password/i }),
        );
        expect(passwordInput).toHaveAttribute("type", "password");
    });

    it("should display validation errors for empty fields", async () => {
        const { user } = renderWithProviders(<Login />);

        const submitBtn = screen.getByRole("button", { name: /Sign in/i });
        await user.click(submitBtn);

        await waitFor(() => {
            expect(
                screen.getByText("Please enter a valid email address"),
            ).toBeInTheDocument();
            expect(
                screen.getByText("Password must be at least 8 characters"),
            ).toBeInTheDocument();
        });
        expect(mockLoginMutate).not.toHaveBeenCalled();
    });

    it("should store token, redirect, and show success toast upon successful login", async () => {
        mockLoginMutate.mockImplementation((payload, options) => {
            options?.onSuccess?.({
                data: {
                    isVerified: true,
                    token: "jwt-test-token",
                    username: "Jane Doe",
                    email: "jane@example.com",
                },
            });
        });

        const { user } = renderWithProviders(<Login />);

        const emailInput = screen.getByLabelText("Email address");
        const passwordInput = screen.getByLabelText("Password");
        const submitBtn = screen.getByRole("button", { name: /Sign in/i });

        await user.type(emailInput, "jane@example.com");
        await user.type(passwordInput, "password123");
        await user.click(submitBtn);

        await waitFor(() => {
            expect(mockLoginMutate).toHaveBeenCalledWith(
                { email: "jane@example.com", password: "password123" },
                expect.any(Object),
            );
            expect(localStorage.getItem("token")).toBe("jwt-test-token");
            expect(localStorage.getItem("name")).toBe("Jane Doe");
            expect(localStorage.getItem("email")).toBe("jane@example.com");
            expect(toast.success).toHaveBeenCalledWith("Login successful!");
            expect(mockNavigate).toHaveBeenCalledWith("/org-setup/select", {
                replace: true,
            });
        });
    });

    it("should redirect to verify-otp if user is not verified", async () => {
        mockLoginMutate.mockImplementation((payload, options) => {
            options?.onSuccess?.({
                data: {
                    isVerified: false,
                    phoneNumber: "+1234567890",
                },
            });
        });

        const { user } = renderWithProviders(<Login />);

        const emailInput = screen.getByLabelText("Email address");
        const passwordInput = screen.getByLabelText("Password");
        const submitBtn = screen.getByRole("button", { name: /Sign in/i });

        await user.type(emailInput, "unverified@example.com");
        await user.type(passwordInput, "password123");
        await user.click(submitBtn);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/verify-otp", {
                state: {
                    email: "unverified@example.com",
                    mobile: "+1234567890",
                },
            });
            expect(toast.info).toHaveBeenCalledWith(
                "Please verify your email and phone number before logging in.",
            );
        });
    });

    it("should show error toast upon login mutation failure", async () => {
        mockLoginMutate.mockImplementation((payload, options) => {
            options?.onError?.({
                response: { data: { message: "Invalid credentials" } },
            });
        });

        const { user } = renderWithProviders(<Login />);

        const emailInput = screen.getByLabelText("Email address");
        const passwordInput = screen.getByLabelText("Password");
        const submitBtn = screen.getByRole("button", { name: /Sign in/i });

        await user.type(emailInput, "jane@example.com");
        await user.type(passwordInput, "password123");
        await user.click(submitBtn);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Invalid credentials");
        });
    });

    it("should show fallback error toast when no error message is provided", async () => {
        mockLoginMutate.mockImplementation((payload, options) => {
            options?.onError?.({});
        });

        const { user } = renderWithProviders(<Login />);

        await user.type(
            screen.getByLabelText("Email address"),
            "jane@example.com",
        );
        await user.type(screen.getByLabelText("Password"), "password123");
        await user.click(screen.getByRole("button", { name: /Sign in/i }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(
                "Login failed. Please try again.",
            );
        });
    });

    it("should render forgot password link", () => {
        renderWithProviders(<Login />);

        const forgotLink = screen.getByText("Forgot password?");
        expect(forgotLink).toBeInTheDocument();
        expect(forgotLink).toHaveAttribute("href", "/forgot-password");
    });

    it("should render create account link", () => {
        renderWithProviders(<Login />);

        const createAccountLink = screen.getByText("Create account");
        expect(createAccountLink).toBeInTheDocument();
        expect(createAccountLink).toHaveAttribute("href", "/register");
    });
});
