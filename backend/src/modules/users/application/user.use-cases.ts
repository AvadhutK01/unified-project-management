import {
    createUser,
    findUserByEmail,
    findUserByPhone,
    updateUserOtp,
    markUserAsVerified,
} from "../infrastructure/user.repository.js";
import {
    badRequestError,
    notFoundError,
    internalServerError,
    unauthorizedError,
} from "../../../shared/errors/app-error.js";
import {
    generateToken,
    generateResetToken,
    verifyResetToken,
} from "../../../shared/utils/jwt.js";

/**
 * Registers a new user or updates OTPs for an unverified user.
 * @param data User input containing username, email, phone number, and password.
 * @throws AppError if the email or phone number is already verified or registered.
 * @returns Object containing registered user details.
 */
export const registerUser = async (data: {
    username: string;
    email: string;
    phoneNumber: string;
    password: string;
}) => {
    const userByEmail = await findUserByEmail(data.email);
    const userByPhone = await findUserByPhone(data.phoneNumber);

    if (userByEmail && userByEmail.isVerified) {
        throw badRequestError("Email already exists");
    }
    if (userByPhone && userByPhone.isVerified) {
        throw badRequestError("Phone number already exists");
    }

    if (userByEmail && userByPhone && userByEmail.id !== userByPhone.id) {
        throw badRequestError("Phone number already exists");
    }

    if (userByEmail) {
        const updated = await updateUserOtp(userByEmail.id, {
            username: data.username,
            phoneNumber: data.phoneNumber,
            password: data.password,
            emailOtp: "123456",
            phoneOtp: "123456",
        });
        if (!updated) {
            throw internalServerError("Failed to update user OTP");
        }
        return {
            id: updated.id,
            username: updated.username,
            email: updated.email,
            phoneNumber: updated.phoneNumber,
            isVerified: updated.isVerified,
            emailOtp: updated.emailOtp,
            phoneOtp: updated.phoneOtp,
        };
    }

    if (userByPhone) {
        const updated = await updateUserOtp(userByPhone.id, {
            username: data.username,
            email: data.email,
            password: data.password,
            emailOtp: "123456",
            phoneOtp: "123456",
        });
        if (!updated) {
            throw internalServerError("Failed to update user OTP");
        }
        return {
            id: updated.id,
            username: updated.username,
            email: updated.email,
            phoneNumber: updated.phoneNumber,
            isVerified: updated.isVerified,
            emailOtp: updated.emailOtp,
            phoneOtp: updated.phoneOtp,
        };
    }

    const newUser = await createUser({
        username: data.username,
        email: data.email,
        phoneNumber: data.phoneNumber,
        password: data.password,
        emailOtp: "123456",
        phoneOtp: "123456",
    });

    if (!newUser) {
        throw internalServerError("Failed to create user");
    }

    return {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        isVerified: newUser.isVerified,
        emailOtp: newUser.emailOtp,
        phoneOtp: newUser.phoneOtp,
    };
};

/**
 * Verifies the user registration using both email and phone OTPs.
 * @param data Data containing email, phone number, emailOtp, and phoneOtp.
 * @throws AppError if the user is not found, already verified, or if any OTP is incorrect.
 * @returns Object containing verified user details and signed JWT token.
 */
export const verifyOtp = async (data: {
    email: string;
    phoneNumber: string;
    emailOtp: string;
    phoneOtp: string;
}) => {
    const user = await findUserByEmail(data.email);
    if (!user || user.phoneNumber !== data.phoneNumber) {
        throw notFoundError(
            "User not found with provided email and phone number",
        );
    }

    if (user.isVerified) {
        throw badRequestError("User is already verified");
    }

    if (user.emailOtp !== data.emailOtp || user.phoneOtp !== data.phoneOtp) {
        throw badRequestError("Invalid email or phone OTP");
    }

    const verifiedUser = await markUserAsVerified(user.id);
    if (!verifiedUser) {
        throw internalServerError("Failed to verify user");
    }
    const token = generateToken({
        id: verifiedUser.id,
        email: verifiedUser.email,
    });
    return {
        id: verifiedUser.id,
        username: verifiedUser.username,
        email: verifiedUser.email,
        phoneNumber: verifiedUser.phoneNumber,
        isVerified: verifiedUser.isVerified,
        token,
    };
};

/**
 * Resends verification OTP to either the user's email or phone number.
 * @param data Object containing optional email and phone number.
 * @throws AppError if neither is provided, if the user is not found, or if already verified.
 * @returns Object containing the updated user details and new OTP values.
 */
export const resendOtp = async (data: {
    email?: string;
    phoneNumber?: string;
}) => {
    if (!data.email && !data.phoneNumber) {
        throw badRequestError("Email or phone number must be provided");
    }

    let user = null;
    if (data.email) {
        user = await findUserByEmail(data.email);
    } else if (data.phoneNumber) {
        user = await findUserByPhone(data.phoneNumber);
    }

    if (!user) {
        throw notFoundError("User not found");
    }

    if (user.isVerified) {
        throw badRequestError("User is already verified");
    }

    const newOtp = "123456";
    const updateFields: { emailOtp?: string; phoneOtp?: string } = {};

    if (data.email) {
        if (user.email !== data.email) {
            throw badRequestError("Email and phone number do not match");
        }
        updateFields.emailOtp = newOtp;
    }
    if (data.phoneNumber) {
        if (user.phoneNumber !== data.phoneNumber) {
            throw badRequestError("Email and phone number do not match");
        }
        updateFields.phoneOtp = newOtp;
    }

    const updated = await updateUserOtp(user.id, updateFields);
    if (!updated) {
        throw internalServerError("Failed to resend OTP");
    }

    return {
        id: updated.id,
        email: updated.email,
        phoneNumber: updated.phoneNumber,
        emailOtp: updated.emailOtp,
        phoneOtp: updated.phoneOtp,
        isVerified: updated.isVerified,
    };
};

/**
 * Logs in a user. Generates a token if verified, or generates and triggers verification OTPs if unverified.
 * @param data Parameters including email and password.
 * @throws AppError if credentials are invalid or if user is not registered.
 * @returns Object indicating verification status, and optionally a token and user details.
 */
export const loginUser = async (data: { email: string; password: string }) => {
    const user = await findUserByEmail(data.email);
    if (!user) {
        throw notFoundError("User is not registered");
    }

    if (user.password !== data.password) {
        throw unauthorizedError("Invalid credentials");
    }

    if (user.isVerified) {
        const token = generateToken({ id: user.id, email: user.email });
        return {
            isVerified: true,
            token,
            id: user.id,
            username: user.username,
            email: user.email,
            phoneNumber: user.phoneNumber,
        };
    }

    const updated = await updateUserOtp(user.id, {
        emailOtp: "123456",
        phoneOtp: "123456",
    });

    if (!updated) {
        throw internalServerError("Failed to generate verification OTP");
    }

    return {
        isVerified: false,
        id: user.id,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
    };
};

/**
 * Generates a password reset OTP for a verified user.
 * @param email The user's email.
 * @throws AppError if the user is not found or is not verified.
 * @returns Object containing user ID, email, and generated OTP.
 */
export const generateResetPwdOtp = async (email: string) => {
    const user = await findUserByEmail(email);
    if (!user) {
        throw notFoundError("User not found");
    }

    if (!user.isVerified) {
        throw badRequestError("User is not verified");
    }

    const updated = await updateUserOtp(user.id, {
        pwdResetOtp: "123456",
    });

    if (!updated) {
        throw internalServerError("Failed to generate password reset OTP");
    }

    return {
        id: updated.id,
        email: updated.email,
        pwdResetOtp: updated.pwdResetOtp,
    };
};

/**
 * Verifies a password reset OTP and generates a temporary reset token.
 * @param data Parameters including email and OTP.
 * @throws AppError if the user is not found, unverified, or if the OTP is invalid.
 * @returns Object containing the generated reset token.
 */
export const verifyPwdResetOtp = async (data: {
    email: string;
    otp: string;
}) => {
    const user = await findUserByEmail(data.email);
    if (!user) {
        throw notFoundError("User not found");
    }

    if (!user.isVerified) {
        throw badRequestError("User is not verified");
    }

    if (!user.pwdResetOtp || user.pwdResetOtp !== data.otp) {
        throw badRequestError("Invalid OTP");
    }

    const updated = await updateUserOtp(user.id, {
        pwdResetOtp: null,
    });

    if (!updated) {
        throw internalServerError("Failed to consume OTP");
    }

    const token = generateResetToken({ email: user.email });
    return {
        token,
    };
};

/**
 * Resets a user's password using a valid reset token.
 * @param data Parameters including reset token and new password.
 * @throws AppError if the token is invalid/expired, user not found, or update fails.
 * @returns Object containing the updated user's ID.
 */
export const resetPassword = async (data: {
    token: string;
    password: string;
}) => {
    try {
        const { email } = verifyResetToken(data.token);
        const user = await findUserByEmail(email);
        if (!user) {
            throw notFoundError("User not found");
        }

        const updated = await updateUserOtp(user.id, {
            password: data.password,
        });

        if (!updated) {
            throw internalServerError("Failed to reset password");
        }

        return {
            id: updated.id,
        };
    } catch (error: unknown) {
        if (error instanceof Error && error.name === "TokenExpiredError") {
            throw badRequestError("Reset password request expired");
        }
        if (
            error instanceof Error &&
            (error.name === "JsonWebTokenError" ||
                error.message === "Invalid token purpose")
        ) {
            throw badRequestError("Invalid reset token");
        }
        throw error;
    }
};
