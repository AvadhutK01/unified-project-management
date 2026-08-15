/**
 * Generates a random 6-digit numeric OTP string for verification.
 * @returns 6-digit OTP string.
 */
export const generateRandomSixDigitOtp = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
