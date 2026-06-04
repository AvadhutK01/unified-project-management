import { Request, Response, NextFunction } from "express";
import {
    registerUser,
    verifyOtp,
    resendOtp,
    loginUser,
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
