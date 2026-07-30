import { useMutation } from "@tanstack/react-query";
import {
    loginUser,
    registerUser,
    resetPassword,
    googleAuth,
    sendPhoneOtp,
    verifyPhoneOtp,
} from "../api/auth.api";

export const useRegisterUser = () => {
    return useMutation({
        mutationFn: registerUser,
    });
};

export const useLoginUser = () => {
    return useMutation({
        mutationFn: loginUser,
    });
};

export const useResetPassword = () => {
    return useMutation({
        mutationFn: resetPassword,
    });
};

export const useGoogleAuth = () => {
    return useMutation({
        mutationFn: googleAuth,
    });
};

export const useSendPhoneOtp = () => {
    return useMutation({
        mutationFn: sendPhoneOtp,
    });
};

export const useVerifyPhoneOtp = () => {
    return useMutation({
        mutationFn: verifyPhoneOtp,
    });
};
