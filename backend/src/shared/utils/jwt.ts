import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

export const generateToken = (payload: {
    id: string;
    email: string;
}): string => {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "1d" });
};
