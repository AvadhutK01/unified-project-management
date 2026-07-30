import { Request, Response, NextFunction } from "express";
import {
    registerUser,
    verifyOtp,
    resendOtp,
    loginUser,
    generateResetPwdOtp,
    verifyPwdResetOtp,
    resetPassword,
    googleAuthUser,
    sendPhoneOtp,
    verifyPhoneOtp,
} from "../application/user.use-cases.js";

/**
 * Handles user registration request.
 * @param req Express request object containing registration body parameters.
 * @param res Express response object.
 * @param next Express next function.
 */
export const handleRegister = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const { username, email, phoneNumber, phone_number, password } =
            req.body;
        const normalizedPhone = phoneNumber || phone_number;
        const result = await registerUser({
            username,
            email,
            phoneNumber: normalizedPhone,
            password,
        });
        return res.status(201).json({
            status: "success",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Handles OTP verification request.
 * @param req Express request object containing email, phone, and OTP values.
 * @param res Express response object.
 * @param next Express next function.
 */
export const handleVerifyOtp = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const {
            email,
            phoneNumber,
            phone_number,
            emailOtp,
            email_otp,
            phoneOtp,
            phone_otp,
        } = req.body;
        const normalizedPhone = phoneNumber || phone_number;
        const normalizedEmailOtp = emailOtp || email_otp;
        const normalizedPhoneOtp = phoneOtp || phone_otp;
        const result = await verifyOtp({
            email,
            phoneNumber: normalizedPhone,
            emailOtp: normalizedEmailOtp,
            phoneOtp: normalizedPhoneOtp,
        });
        return res.status(200).json({
            status: "success",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Handles OTP resend request.
 * @param req Express request object containing email or phone.
 * @param res Express response object.
 * @param next Express next function.
 */
export const handleResendOtp = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const { email, phoneNumber, phone_number } = req.body;
        const normalizedPhone = phoneNumber || phone_number;
        const result = await resendOtp({
            email,
            phoneNumber: normalizedPhone,
        });
        return res.status(200).json({
            status: "success",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Handles user login request.
 * @param req Express request object containing email and password.
 * @param res Express response object.
 * @param next Express next function.
 */
export const handleLogin = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const { email, password } = req.body;
        const result = await loginUser({ email, password });
        return res.status(200).json({
            status: "success",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Handles generating password reset OTP.
 * @param req Express request object containing email.
 * @param res Express response object.
 * @param next Express next function.
 */
export const handleGenerateResetPwdOtp = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const { email } = req.body;
        const result = await generateResetPwdOtp(email);
        return res.status(200).json({
            status: "success",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Handles verifying password reset OTP and returning a reset token.
 * @param req Express request object containing email and otp.
 * @param res Express response object.
 * @param next Express next function.
 */
export const handleVerifyResetPwdOtp = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const { email, otp } = req.body;
        const result = await verifyPwdResetOtp({ email, otp });
        return res.status(200).json({
            status: "success",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Handles password reset request.
 * @param req Express request object containing token and new password.
 * @param res Express response object.
 * @param next Express next function.
 */
export const handleResetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const { token, password } = req.body;
        const result = await resetPassword({ token, password });
        return res.status(200).json({
            status: "success",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Handles Google SSO authentication request.
 */
export const handleGoogleAuth = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const { idToken, id_token } = req.body;
        const normalizedToken = idToken || id_token;
        const result = await googleAuthUser({ idToken: normalizedToken });
        return res.status(200).json({
            status: "success",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Handles sending Phone OTP for phone binding.
 */
export const handleSendPhoneOtp = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const { email, phoneNumber, phone_number } = req.body;
        const normalizedPhone = phoneNumber || phone_number;
        const result = await sendPhoneOtp({
            email,
            phoneNumber: normalizedPhone,
        });
        return res.status(200).json({
            status: "success",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Handles verifying Phone OTP.
 */
export const handleVerifyPhoneOtp = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    try {
        const { email, phoneNumber, phone_number, phoneOtp, phone_otp } =
            req.body;
        const normalizedPhone = phoneNumber || phone_number;
        const normalizedOtp = phoneOtp || phone_otp;
        const result = await verifyPhoneOtp({
            email,
            phoneNumber: normalizedPhone,
            phoneOtp: normalizedOtp,
        });
        return res.status(200).json({
            status: "success",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};
