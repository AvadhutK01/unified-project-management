import { useMutation } from "@tanstack/react-query";
import { resendOtp, verifyOtp } from "../api/auth.api";

export const useVerifyOtp = () => {
    return useMutation({
        mutationFn: verifyOtp,
    });
};

export const useResendOtp = () => {
    return useMutation({
        mutationFn: resendOtp,
    });
};
