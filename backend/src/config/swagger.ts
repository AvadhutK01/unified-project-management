import { Express } from "express";
import swaggerUi from "swagger-ui-express";

const swaggerDocument = {
    openapi: "3.0.0",
    info: {
        title: "User Registration & OTP Verification API",
        version: "1.0.0",
        description:
            "API documentation for user registration, OTP verification, and resend OTP endpoints.",
    },
    servers: [
        {
            url: "/api",
            description: "Local server",
        },
    ],
    paths: {
        "/users/register": {
            post: {
                summary: "Register a new user",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: [
                                    "username",
                                    "email",
                                    "password",
                                    "phoneNumber",
                                ],
                                properties: {
                                    username: { type: "string" },
                                    email: { type: "string", format: "email" },
                                    password: { type: "string" },
                                    phoneNumber: { type: "string" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: "User registered successfully",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: {
                                            type: "string",
                                            example: "success",
                                        },
                                        data: {
                                            type: "object",
                                            properties: {
                                                id: { type: "string" },
                                                username: { type: "string" },
                                                email: { type: "string" },
                                                phoneNumber: { type: "string" },
                                                isVerified: { type: "boolean" },
                                                emailOtp: { type: "string" },
                                                phoneOtp: { type: "string" },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    400: { description: "Bad Request" },
                },
            },
        },
        "/users/verify": {
            post: {
                summary: "Verify user OTPs",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: [
                                    "email",
                                    "phoneNumber",
                                    "emailOtp",
                                    "phoneOtp",
                                ],
                                properties: {
                                    email: { type: "string", format: "email" },
                                    phoneNumber: { type: "string" },
                                    emailOtp: { type: "string" },
                                    phoneOtp: { type: "string" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description:
                            "User verified successfully. JWT token is returned in the response body.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: {
                                            type: "string",
                                            example: "success",
                                        },
                                        data: {
                                            type: "object",
                                            properties: {
                                                id: { type: "string" },
                                                username: { type: "string" },
                                                email: { type: "string" },
                                                phoneNumber: { type: "string" },
                                                isVerified: { type: "boolean" },
                                                token: { type: "string" },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    400: { description: "Invalid OTP or Bad Request" },
                    404: { description: "User not found" },
                },
            },
        },
        "/users/resend": {
            post: {
                summary: "Resend OTP",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    email: { type: "string", format: "email" },
                                    phoneNumber: { type: "string" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "OTP resent successfully",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: {
                                            type: "string",
                                            example: "success",
                                        },
                                        data: {
                                            type: "object",
                                            properties: {
                                                id: { type: "string" },
                                                email: { type: "string" },
                                                phoneNumber: { type: "string" },
                                                emailOtp: { type: "string" },
                                                phoneOtp: { type: "string" },
                                                isVerified: { type: "boolean" },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    400: { description: "Bad Request" },
                    404: { description: "User not found" },
                },
            },
        },
        "/users/login": {
            post: {
                summary: "Login user",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["email", "password"],
                                properties: {
                                    email: { type: "string", format: "email" },
                                    password: { type: "string" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description:
                            "Login response indicating verification status. JWT token is returned in the response body if verified.",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: {
                                            type: "string",
                                            example: "success",
                                        },
                                        data: {
                                            type: "object",
                                            properties: {
                                                isVerified: { type: "boolean" },
                                                id: { type: "string" },
                                                username: { type: "string" },
                                                email: { type: "string" },
                                                phoneNumber: { type: "string" },
                                                token: { type: "string" },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    400: { description: "Bad Request" },
                    401: { description: "Invalid credentials" },
                    404: {
                        description: "User is not registered",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: {
                                            type: "string",
                                            example: "error",
                                        },
                                        message: {
                                            type: "string",
                                            example: "User is not registered",
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};

/**
 * Binds Swagger UI middleware to the Express application under /api-docs path.
 * @param app Express application object.
 */
export const serveSwagger = (app: Express): void => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
