import { Router } from "express";
import {
    handleRegister,
    handleVerifyOtp,
    handleResendOtp,
    handleLogin,
    handleGenerateResetPwdOtp,
    handleVerifyResetPwdOtp,
    handleResetPassword,
    handleGoogleAuth,
    handleSendPhoneOtp,
    handleVerifyPhoneOtp,
} from "./user.controller.js";
import { validateRequest } from "../../../shared/validators/index.js";
import {
    registerSchema,
    verifyOtpSchema,
    resendOtpSchema,
    loginSchema,
    generateResetPwdOtpSchema,
    verifyResetPwdOtpSchema,
    resetPasswordSchema,
    googleAuthSchema,
    sendPhoneOtpSchema,
    verifyPhoneOtpSchema,
} from "./user.validation.js";

const router = Router();

router.post("/register", validateRequest(registerSchema), handleRegister);
router.post("/verify", validateRequest(verifyOtpSchema), handleVerifyOtp);
router.post("/resend", validateRequest(resendOtpSchema), handleResendOtp);
router.post("/login", validateRequest(loginSchema), handleLogin);
router.post(
    "/google-auth",
    validateRequest(googleAuthSchema),
    handleGoogleAuth,
);
router.post(
    "/send-phone-otp",
    validateRequest(sendPhoneOtpSchema),
    handleSendPhoneOtp,
);
router.post(
    "/verify-phone-otp",
    validateRequest(verifyPhoneOtpSchema),
    handleVerifyPhoneOtp,
);
router.post(
    "/generate-reset-pwd-otp",
    validateRequest(generateResetPwdOtpSchema),
    handleGenerateResetPwdOtp,
);
router.post(
    "/verify-reset-pwd-otp",
    validateRequest(verifyResetPwdOtpSchema),
    handleVerifyResetPwdOtp,
);
router.post(
    "/reset-password",
    validateRequest(resetPasswordSchema),
    handleResetPassword,
);

export { router as userRouter };
