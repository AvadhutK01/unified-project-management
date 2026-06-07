import { useMutation } from "@tanstack/react-query";
import {
    getResetPasswordOtp,
    resendOtp,
    verifyOtp,
    verifyResetPasswordOtp,
} from "../api/auth.api";

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

export const useGenerateResetPasswordOtp = () => {
    return useMutation({
        mutationFn: getResetPasswordOtp,
    });
};

export const useVerifyResetPasswordOtp = () => {
    return useMutation({
        mutationFn: verifyResetPasswordOtp,
    });
};
