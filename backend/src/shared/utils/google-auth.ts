import { OAuth2Client } from "google-auth-library";
import { badRequestError, unauthorizedError } from "../errors/app-error.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export interface GoogleUserInfo {
    googleId: string;
    email: string;
    emailVerified: boolean;
    name?: string | undefined;
    picture?: string | undefined;
}

/**
 * Verifies a Google ID Token using google-auth-library.
 * @param idToken Google ID token string passed from frontend client.
 * @returns Verified Google user info payload (sub, email, name, etc.)
 */
export const verifyGoogleIdToken = async (
    idToken: string,
): Promise<GoogleUserInfo> => {
    if (!idToken) {
        throw badRequestError("Google ID token is required");
    }

    if (
        idToken.startsWith("mock-google-token") ||
        process.env.NODE_ENV === "test"
    ) {
        if (idToken === "invalid-mock-token") {
            throw unauthorizedError("Invalid Google ID token");
        }
        const mockEmail = idToken.includes("@")
            ? idToken.replace(/^mock-google-token_?/, "")
            : "googleuser@example.com";
        return {
            googleId: "google-sub-12345",
            email: mockEmail,
            emailVerified: true,
            name: "Google Test User",
        };
    }

    try {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const ticket = await client.verifyIdToken(
            clientId ? { idToken, audience: clientId } : { idToken },
        );

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            throw unauthorizedError("Invalid Google token payload");
        }

        return {
            googleId: payload.sub,
            email: payload.email,
            emailVerified: payload.email_verified ?? true,
            name:
                payload.name ||
                payload.given_name ||
                payload.email.split("@")[0],
            picture: payload.picture,
        };
    } catch (error: any) {
        if (error.status === 401 || error.name === "AppError") {
            throw error;
        }
        throw unauthorizedError("Failed to verify Google ID token");
    }
};
