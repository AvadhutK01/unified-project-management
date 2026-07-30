import { api } from "@/lib/axios";

/**
 * Submit email or phone OTP values to verify the user.
 *
 * @param payload.email Optional email address used for verification.
 * @param payload.phoneNumber Optional phone number used for verification.
 * @param payload.emailOtp OTP code sent to the email address.
 * @param payload.phoneOtp OTP code sent to the phone number.
 * @returns The API response data from the verify endpoint.
 */
export const verifyOtp = async (payload: {
    email?: string;
    phoneNumber?: string;
    emailOtp?: string;
    phoneOtp?: string;
}) => {
    const { data } = await api.post("/users/verify", payload);
    return data;
};

/**
 * Request a new OTP for email or phone verification.
 *
 * @param payload.email Optional email address to resend the OTP to.
 * @param payload.phoneNumber Optional phone number to resend the OTP to.
 * @returns The API response data from the resend endpoint.
 */
export const resendOtp = async (payload: {
    email?: string;
    phoneNumber?: string;
}) => {
    const { data } = await api.post("/users/resend", payload);
    return data;
};

/**
 * Register a new user with username, email, phone number, and password.
 *
 * @param payload.username The full name or username for the new account.
 * @param payload.email The email address for the new account.
 * @param payload.phoneNumber The phone number for the new account.
 * @param payload.password The password for the new account.
 * @returns The API response data from the register endpoint.
 */
export const registerUser = async (payload: {
    username: string;
    email: string;
    phoneNumber: string;
    password: string;
}) => {
    const { data } = await api.post("/users/register", payload);
    return data;
};

/**
 * Log in a user with email and password.
 *
 * @param payload.email The email address of the user trying to log in.
 * @param payload.password The password of the user trying to log in.
 * @returns The API response data from the login endpoint, including token and user info.
 */
export const loginUser = async (payload: {
    email: string;
    password: string;
}) => {
    const { data } = await api.post("/users/login", payload);
    return data;
};

/** Request a password reset OTP to be sent to the user's email.
 *
 * @param payload.email The email address of the user requesting a password reset.
 * @returns The API response data from the reset password OTP request endpoint.
 */
export const getResetPasswordOtp = async (payload: { email: string }) => {
    const { data } = await api.post("/users/generate-reset-pwd-otp", payload);
    return data;
};

/**
 * Verify the OTP for password reset.
 *
 * @param payload.email The email address of the user verifying the OTP.
 * @param payload.otp The OTP code sent to the user's email for password reset.
 * @returns The API response data from the verify reset password OTP endpoint.
 */
export const verifyResetPasswordOtp = async (payload: {
    email: string;
    otp: string;
}) => {
    const { data } = await api.post("/users/verify-reset-pwd-otp", payload);
    return data;
};

/**
 * Reset the user's password using a valid token and new password.
 *
 * @param payload.token The token received after verifying the reset password OTP.
 * @param payload.password The new password that the user wants to set.
 * @returns The API response data from the reset password endpoint.
 */
export const resetPassword = async (payload: {
    token: string;
    password: string;
}) => {
    const { data } = await api.post("/users/reset-password", payload);
    return data;
};

/**
 * Authenticate with Google SSO using Google ID Token.
 */
export const googleAuth = async (payload: { idToken: string }) => {
    const { data } = await api.post("/users/google-auth", payload);
    return data;
};

/**
 * Request Phone OTP for binding phone number to user account.
 */
export const sendPhoneOtp = async (payload: {
    email: string;
    phoneNumber: string;
}) => {
    const { data } = await api.post("/users/send-phone-otp", payload);
    return data;
};

/**
 * Verify Phone OTP for Google SSO onboarding.
 */
export const verifyPhoneOtp = async (payload: {
    email: string;
    phoneNumber: string;
    phoneOtp: string;
}) => {
    const { data } = await api.post("/users/verify-phone-otp", payload);
    return data;
};
