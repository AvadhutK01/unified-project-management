import { MiniMoth } from "@minimoth/sdk-node";
import { env } from "../../config/env.js";
import { generateRandomSixDigitOtp } from "./common.js";
const mm = new MiniMoth({
    apiKey: env.MINIMOTH_API_KEY,
});

/**
 * Dispatches an SMS OTP to a mobile phone number using MiniMoth SDK.
 * @param mobileNumber Target phone number string.
 * @returns Object containing otpId and delivery status object.
 */
export const sendSMSOtp = async (mobileNumber: string) => {
    if (env.NODE_ENV === "test" || env.MINIMOTH_API_KEY?.startsWith("mock")) {
        return { otpId: "mock-otp-id", delivery: { status: "delivered" } };
    }
    const { otpId } = await mm.otp.send({ phone: mobileNumber });
    const delivery = await mm.otp.status(otpId);
    return { otpId, delivery };
};

/**
 * Verifies an SMS OTP string against a mobile phone number using MiniMoth SDK.
 * @param mobileNumber Target phone number string.
 * @param otp 6-digit OTP string provided by user.
 * @returns Verification result object containing valid boolean flag.
 */
export const verifySMSOtp = async (mobileNumber: string, otp: string) => {
    if (env.NODE_ENV === "test" || env.MINIMOTH_API_KEY?.startsWith("mock")) {
        if (otp === "123456") {
            return { valid: true };
        }
        return { valid: false };
    }
    const result = await mm.otp.verify({ phone: mobileNumber, otp });
    return result;
};

export const verifyOtp = verifySMSOtp;
