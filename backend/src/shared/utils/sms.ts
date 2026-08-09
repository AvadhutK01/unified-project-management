import { MiniMoth } from "@minimoth/sdk-node";
import { env } from "../../config/env.js";
import { generateRandomSixDigitOtp } from "./common.js";
const mm = new MiniMoth({
    apiKey: env.MINIMOTH_API_KEY,
});

export const sendSMSOtp = async (mobileNumber: string) => {
    if (env.NODE_ENV === "test" || env.MINIMOTH_API_KEY?.startsWith("mock")) {
        return { otpId: "mock-otp-id", delivery: { status: "delivered" } };
    }
    const { otpId } = await mm.otp.send({ phone: mobileNumber });
    const delivery = await mm.otp.status(otpId);
    return { otpId, delivery };
};

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
