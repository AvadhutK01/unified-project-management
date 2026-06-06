import { api } from "@/lib/axios";

export const verifyOtp = async (payload: {
    email?: string;
    phoneNumber?: string;
    emailOtp?: string;
    phoneOtp?: string;
}) => {
    const { data } = await api.post("/users/verify", payload);
    return data;
};

export const resendOtp = async (payload: {
    email?: string;
    phoneNumber?: string;
}) => {
    const { data } = await api.post("/users/resend", payload);
    return data;
};
