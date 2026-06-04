import { Router } from "express";
import {
    handleRegister,
    handleVerifyOtp,
    handleResendOtp,
    handleLogin,
} from "./user.controller.js";
import { validateRequest } from "../../../shared/validators/index.js";
import {
    registerSchema,
    verifyOtpSchema,
    resendOtpSchema,
    loginSchema,
} from "./user.validation.js";

const router = Router();

router.post("/register", validateRequest(registerSchema), handleRegister);
router.post("/verify", validateRequest(verifyOtpSchema), handleVerifyOtp);
router.post("/resend", validateRequest(resendOtpSchema), handleResendOtp);
router.post("/login", validateRequest(loginSchema), handleLogin);

export { router as userRouter };
