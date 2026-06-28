import React from "react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { renderWithProviders } from "@/test/utils";
import Register from "./Register";
import { useRegisterUser } from "../hooks/useAuth";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const original = await vi.importActual("react-router-dom");
    return {
        ...original,
        useNavigate: () => mockNavigate,
    };
});

vi.mock("../hooks/useAuth", () => ({
    useRegisterUser: vi.fn(),
}));

vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        dismiss: vi.fn(),
    },
}));

describe("Register Page Component", () => {
    const mockRegisterMutate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useRegisterUser).mockReturnValue({
            mutate: mockRegisterMutate,
            isPending: false,
        } as any);
    });

    it("should render Step 0 (account info) by default", () => {
        renderWithProviders(<Register />);

        expect(screen.getByText("Create your account")).toBeInTheDocument();
        expect(screen.getByLabelText("Full name")).toBeInTheDocument();
        expect(screen.getByLabelText("Work email")).toBeInTheDocument();
        expect(screen.getByLabelText("Mobile number")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /Continue/i }),
        ).toBeInTheDocument();
    });

    it("should fail step 0 validation and not proceed if inputs are empty", async () => {
        const { user } = renderWithProviders(<Register />);

        const continueBtn = screen.getByRole("button", { name: /Continue/i });
        await user.click(continueBtn);

        await waitFor(() => {
            expect(
                screen.getByText("Name must be at least 2 characters"),
            ).toBeInTheDocument();
            expect(
                screen.getByText("Please enter a valid email address"),
            ).toBeInTheDocument();
            expect(
                screen.getByText("Please enter a valid mobile number"),
            ).toBeInTheDocument();
        });

        // Still on step 0
        expect(screen.queryByLabelText("Password")).not.toBeInTheDocument();
    });

    it("should transition to step 1 upon valid inputs on step 0, and allow going back", async () => {
        const { user } = renderWithProviders(<Register />);

        const nameInput = screen.getByLabelText("Full name");
        const emailInput = screen.getByLabelText("Work email");
        const mobileInput = screen.getByLabelText("Mobile number");
        const continueBtn = screen.getByRole("button", { name: /Continue/i });

        await user.type(nameInput, "John Doe");
        await user.type(emailInput, "john@example.com");
        await user.type(mobileInput, "+12345678901");
        await user.click(continueBtn);

        // Transition to step 1
        await waitFor(() => {
            expect(screen.getByText("Secure your account")).toBeInTheDocument();
            expect(screen.getByLabelText("Password")).toBeInTheDocument();
        });

        // Click back button
        const backBtn = screen.getByRole("button", { name: /Back/i });
        await user.click(backBtn);

        // Transition back to step 0
        await waitFor(() => {
            expect(screen.getByText("Create your account")).toBeInTheDocument();
            expect(screen.getByLabelText("Full name")).toBeInTheDocument();
        });
    });

    it("should show password strength and mismatch validations on step 1", async () => {
        const { user } = renderWithProviders(<Register />);

        // Step 0
        await user.type(screen.getByLabelText("Full name"), "John Doe");
        await user.type(
            screen.getByLabelText("Work email"),
            "john@example.com",
        );
        await user.type(screen.getByLabelText("Mobile number"), "+12345678901");
        await user.click(screen.getByRole("button", { name: /Continue/i }));

        await waitFor(() => {
            expect(screen.getByLabelText("Password")).toBeInTheDocument();
        });

        const pwInput = screen.getByLabelText("Password");
        const confirmInput = screen.getByLabelText("Confirm password");
        const createBtn = screen.getByRole("button", {
            name: /Create account/i,
        });

        await user.type(pwInput, "Password123");
        expect(screen.getByText(/Strength:/i)).toBeInTheDocument();
        expect(screen.getByText("Good")).toBeInTheDocument();

        // Check the terms checkbox so field-level validations pass
        const termsCheckbox = screen.getByRole("checkbox");
        await user.click(termsCheckbox);

        await user.type(confirmInput, "Password456");
        await user.click(createBtn);

        await waitFor(() => {
            expect(
                screen.getByText("Passwords do not match"),
            ).toBeInTheDocument();
        });
    });

    it("should successfully trigger mutation and navigation on valid submission", async () => {
        mockRegisterMutate.mockImplementation((payload, options) => {
            options?.onSuccess?.();
        });

        const { user } = renderWithProviders(<Register />);

        // Fill Step 0
        await user.type(screen.getByLabelText("Full name"), "John Doe");
        await user.type(
            screen.getByLabelText("Work email"),
            "john@example.com",
        );
        await user.type(screen.getByLabelText("Mobile number"), "+12345678901");
        await user.click(screen.getByRole("button", { name: /Continue/i }));

        // Fill Step 1
        await waitFor(() => {
            expect(screen.getByLabelText("Password")).toBeInTheDocument();
        });

        await user.type(screen.getByLabelText("Password"), "Password123");
        await user.type(
            screen.getByLabelText("Confirm password"),
            "Password123",
        );

        // Check terms checkbox (which is styled via custom checkbox, hidden input inside label)
        // Since terms is sr-only, we can query it by label or check it directly. Let's find checkbox by role
        const termsCheckbox = screen.getByRole("checkbox");
        await user.click(termsCheckbox);

        const createBtn = screen.getByRole("button", {
            name: /Create account/i,
        });
        await user.click(createBtn);

        await waitFor(() => {
            expect(mockRegisterMutate).toHaveBeenCalledWith(
                {
                    username: "John Doe",
                    email: "john@example.com",
                    phoneNumber: "+12345678901",
                    password: "Password123",
                },
                expect.any(Object),
            );
            expect(mockNavigate).toHaveBeenCalledWith("/verify-otp", {
                state: { email: "john@example.com", mobile: "+12345678901" },
            });
            expect(toast.success).toHaveBeenCalledWith(
                "Account created! Please verify your email and phone number.",
            );
        });
    });

    it("should show validation errors on step 1 for weak password", async () => {
        const { user } = renderWithProviders(<Register />);

        // Step 0
        await user.type(screen.getByLabelText("Full name"), "John Doe");
        await user.type(
            screen.getByLabelText("Work email"),
            "john@example.com",
        );
        await user.type(screen.getByLabelText("Mobile number"), "+12345678901");
        await user.click(screen.getByRole("button", { name: /Continue/i }));

        await waitFor(() => {
            expect(screen.getByLabelText("Password")).toBeInTheDocument();
        });

        const pwInput = screen.getByLabelText("Password");
        const createBtn = screen.getByRole("button", {
            name: /Create account/i,
        });

        // Empty password submission
        await user.click(createBtn);

        await waitFor(() => {
            expect(
                screen.getByText("Password must be at least 8 characters"),
            ).toBeInTheDocument();
        });
    });

    it("should display error toast on registration failure", async () => {
        mockRegisterMutate.mockImplementation((payload, options) => {
            options?.onError?.({
                response: { data: { message: "Email already registered" } },
            });
        });

        const { user } = renderWithProviders(<Register />);

        // Fill Step 0
        await user.type(screen.getByLabelText("Full name"), "John Doe");
        await user.type(
            screen.getByLabelText("Work email"),
            "existing@example.com",
        );
        await user.type(screen.getByLabelText("Mobile number"), "+12345678901");
        await user.click(screen.getByRole("button", { name: /Continue/i }));

        // Fill Step 1
        await waitFor(() => {
            expect(screen.getByLabelText("Password")).toBeInTheDocument();
        });

        await user.type(screen.getByLabelText("Password"), "Password123");
        await user.type(
            screen.getByLabelText("Confirm password"),
            "Password123",
        );
        await user.click(screen.getByRole("checkbox"));
        await user.click(
            screen.getByRole("button", { name: /Create account/i }),
        );

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(
                "Email already registered",
            );
        });
    });

    it("should show fallback error toast when no error message provided", async () => {
        mockRegisterMutate.mockImplementation((payload, options) => {
            options?.onError?.({});
        });

        const { user } = renderWithProviders(<Register />);

        await user.type(screen.getByLabelText("Full name"), "John Doe");
        await user.type(
            screen.getByLabelText("Work email"),
            "john@example.com",
        );
        await user.type(screen.getByLabelText("Mobile number"), "+12345678901");
        await user.click(screen.getByRole("button", { name: /Continue/i }));

        await waitFor(() => {
            expect(screen.getByLabelText("Password")).toBeInTheDocument();
        });

        await user.type(screen.getByLabelText("Password"), "Password123");
        await user.type(
            screen.getByLabelText("Confirm password"),
            "Password123",
        );
        await user.click(screen.getByRole("checkbox"));
        await user.click(
            screen.getByRole("button", { name: /Create account/i }),
        );

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(
                "Registration failed. Please try again.",
            );
        });
    });
});
