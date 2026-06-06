import { useMutation } from "@tanstack/react-query";
import { loginUser, registerUser, resetPassword } from "../api/auth.api";

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
