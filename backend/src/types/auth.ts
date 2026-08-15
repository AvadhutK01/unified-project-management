export interface GoogleUserInfo {
    googleId: string;
    email: string;
    emailVerified: boolean;
    name: string;
    picture?: string | undefined;
}
