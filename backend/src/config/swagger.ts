import { Express } from "express";
import swaggerUi from "swagger-ui-express";

const swaggerDocument = {
    openapi: "3.0.0",
    info: {
        title: "Project Management API",
        version: "1.0.0",
        description:
            "API documentation for user authentication, OTP verification, organization management, roles, and permissions.",
    },
    servers: [
        {
            url: "/api",
            description: "Local server",
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            },
        },
    },
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
        "/users/generate-reset-pwd-otp": {
            post: {
                summary: "Generate password reset OTP",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["email"],
                                properties: {
                                    email: { type: "string", format: "email" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Reset OTP generated successfully",
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
                                                pwdResetOtp: { type: "string" },
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
        "/users/verify-reset-pwd-otp": {
            post: {
                summary: "Verify password reset OTP",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["email", "otp"],
                                properties: {
                                    email: { type: "string", format: "email" },
                                    otp: { type: "string" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description:
                            "OTP verified successfully. Temporary reset token is returned.",
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
                                                token: { type: "string" },
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
        "/users/reset-password": {
            post: {
                summary: "Reset user password with valid token",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["token", "password"],
                                properties: {
                                    token: { type: "string" },
                                    password: { type: "string" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Password reset successfully",
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
        "/organizations": {
            post: {
                summary: "Create a new organization",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "multipart/form-data": {
                            schema: {
                                type: "object",
                                required: ["name", "slug"],
                                properties: {
                                    name: { type: "string" },
                                    slug: { type: "string" },
                                    logo: { type: "string", format: "binary" },
                                    websiteUrl: {
                                        type: "string",
                                        format: "uri",
                                    },
                                    description: { type: "string" },
                                    status: {
                                        type: "string",
                                        enum: ["active", "inactive"],
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: { description: "Organization created successfully" },
                    400: { description: "Bad Request" },
                    401: { description: "Unauthorized" },
                },
            },
            get: {
                summary: "Get all organizations",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "page",
                        in: "query",
                        schema: { type: "integer", default: 1 },
                    },
                    {
                        name: "limit",
                        in: "query",
                        schema: { type: "integer", default: 10 },
                    },
                    { name: "search", in: "query", schema: { type: "string" } },
                ],
                responses: {
                    200: { description: "List of all organizations" },
                    401: { description: "Unauthorized" },
                },
            },
        },
        "/organizations/mine": {
            get: {
                summary: "Get organizations owned by the authenticated user",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "page",
                        in: "query",
                        schema: { type: "integer", default: 1 },
                    },
                    {
                        name: "limit",
                        in: "query",
                        schema: { type: "integer", default: 10 },
                    },
                    { name: "search", in: "query", schema: { type: "string" } },
                ],
                responses: {
                    200: { description: "List of user's organizations" },
                    401: { description: "Unauthorized" },
                },
            },
        },
        "/organizations/{id}": {
            get: {
                summary: "Get an organization by ID",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                    },
                ],
                responses: {
                    200: { description: "Organization details" },
                    401: { description: "Unauthorized" },
                    404: { description: "Not found" },
                },
            },
            put: {
                summary: "Update an organization (owner only)",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "multipart/form-data": {
                            schema: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    slug: { type: "string" },
                                    logo: { type: "string", format: "binary" },
                                    websiteUrl: {
                                        type: "string",
                                        format: "uri",
                                        nullable: true,
                                    },
                                    description: {
                                        type: "string",
                                        nullable: true,
                                    },
                                    status: {
                                        type: "string",
                                        enum: ["active", "inactive"],
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: "Organization updated successfully" },
                    400: { description: "Bad Request" },
                    401: { description: "Unauthorized" },
                    403: { description: "Forbidden" },
                    404: { description: "Not found" },
                },
            },
            delete: {
                summary: "Delete an organization (owner only)",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                    },
                ],
                responses: {
                    200: { description: "Organization deleted successfully" },
                    401: { description: "Unauthorized" },
                    403: { description: "Forbidden" },
                },
            },
        },
        "/organizations/members/invite": {
            post: {
                summary: "Invite members to an organization",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "org_id",
                        in: "header",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        description: "Organization ID",
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["invitations"],
                                properties: {
                                    invitations: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            required: ["email", "roleId"],
                                            properties: {
                                                email: {
                                                    type: "string",
                                                    format: "email",
                                                },
                                                roleId: {
                                                    type: "string",
                                                    format: "uuid",
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: { description: "Members invited successfully" },
                    400: { description: "Bad Request" },
                    401: { description: "Unauthorized" },
                },
            },
        },
        "/organizations/invitations": {
            get: {
                summary: "Get pending invitations for the authenticated user",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "page",
                        in: "query",
                        schema: { type: "integer", default: 1 },
                    },
                    {
                        name: "limit",
                        in: "query",
                        schema: { type: "integer", default: 10 },
                    },
                ],
                responses: {
                    200: { description: "List of pending invitations" },
                    401: { description: "Unauthorized" },
                },
            },
        },
        "/organizations/invitations/{id}": {
            delete: {
                summary: "Revoke a pending invitation",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "org_id",
                        in: "header",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        description: "Organization ID",
                    },
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        description: "Invitation ID",
                    },
                ],
                responses: {
                    200: { description: "Invitation revoked successfully" },
                    400: { description: "Bad Request" },
                    401: { description: "Unauthorized" },
                    404: { description: "Invitation not found" },
                },
            },
        },
        "/organizations/invitations/{id}/status": {
            put: {
                summary: "Update invitation status (accept/reject)",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["status"],
                                properties: {
                                    status: {
                                        type: "string",
                                        enum: ["accepted", "rejected"],
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Invitation status updated successfully",
                    },
                    400: { description: "Bad Request" },
                    401: { description: "Unauthorized" },
                    404: { description: "Not Found" },
                },
            },
        },
        "/organizations/members": {
            get: {
                summary: "Get organization members list",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "org_id",
                        in: "header",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        description: "Organization ID",
                    },
                    {
                        name: "type",
                        in: "query",
                        required: true,
                        schema: { type: "string", enum: ["invited", "joined"] },
                    },
                    {
                        name: "page",
                        in: "query",
                        schema: { type: "integer", default: 1 },
                    },
                    {
                        name: "limit",
                        in: "query",
                        schema: { type: "integer", default: 10 },
                    },
                    {
                        name: "search",
                        in: "query",
                        schema: { type: "string" },
                        description: "Search keyword for username or email",
                    },
                ],
                responses: {
                    200: { description: "List of members or invited users" },
                    401: { description: "Unauthorized" },
                },
            },
        },
        "/organizations/members/re-invite": {
            post: {
                summary: "Re-invite a previously rejected member",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "org_id",
                        in: "header",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        description: "Organization ID",
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["email", "roleId"],
                                properties: {
                                    email: { type: "string", format: "email" },
                                    roleId: { type: "string", format: "uuid" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: "Member re-invited successfully" },
                    400: { description: "Bad Request" },
                    401: { description: "Unauthorized" },
                },
            },
        },
        "/organizations/members/me/role": {
            get: {
                summary:
                    "Get current user's role and permissions inside an organization",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "org_id",
                        in: "header",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        description: "Organization ID",
                    },
                ],
                responses: {
                    200: {
                        description:
                            "Current user's member role details retrieved successfully",
                    },
                    401: { description: "Unauthorized" },
                },
            },
        },
        "/organizations/members/{id}": {
            get: {
                summary: "Get organization member details",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "org_id",
                        in: "header",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        description: "Organization ID",
                    },
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        description: "Member ID",
                    },
                ],
                responses: {
                    200: { description: "Member details fetched successfully" },
                    400: { description: "Bad Request" },
                    401: { description: "Unauthorized" },
                    404: { description: "Member not found" },
                },
            },
            put: {
                summary: "Edit organization member role and status",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "org_id",
                        in: "header",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        description: "Organization ID",
                    },
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        description: "Member ID",
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    roleId: { type: "string", format: "uuid" },
                                    status: {
                                        type: "string",
                                        enum: ["active", "inactive", "onleave"],
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: "Member details updated successfully" },
                    400: { description: "Bad Request" },
                    401: { description: "Unauthorized" },
                    404: { description: "Member not found" },
                },
            },
            delete: {
                summary: "Soft delete organization member",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "org_id",
                        in: "header",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        description: "Organization ID",
                    },
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        description: "Member ID",
                    },
                ],
                responses: {
                    200: { description: "Member soft deleted successfully" },
                    400: { description: "Bad Request" },
                    401: { description: "Unauthorized" },
                    404: { description: "Member not found" },
                },
            },
        },
        "/roles": {
            post: {
                summary: "Create a new role",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "org_id",
                        in: "header",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        description: "Organization ID",
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["name"],
                                properties: {
                                    name: {
                                        type: "string",
                                        minLength: 2,
                                        maxLength: 255,
                                    },
                                    description: {
                                        type: "string",
                                        maxLength: 1000,
                                    },
                                    permissionIds: {
                                        type: "array",
                                        items: {
                                            type: "string",
                                            format: "uuid",
                                        },
                                    },
                                    isActive: { type: "boolean" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: "Role created successfully",
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
                                                id: {
                                                    type: "string",
                                                    format: "uuid",
                                                },
                                                name: { type: "string" },
                                                description: { type: "string" },
                                                isActive: { type: "boolean" },
                                                permissions: {
                                                    type: "array",
                                                    items: {
                                                        type: "object",
                                                        properties: {
                                                            id: {
                                                                type: "string",
                                                                format: "uuid",
                                                            },
                                                            name: {
                                                                type: "string",
                                                            },
                                                            codename: {
                                                                type: "string",
                                                            },
                                                            description: {
                                                                type: "string",
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
                    },
                    400: { description: "Bad Request" },
                    401: { description: "Unauthorized" },
                },
            },
            get: {
                summary: "Get all roles with pagination",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "org_id",
                        in: "header",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        description: "Organization ID",
                    },
                    {
                        name: "page",
                        in: "query",
                        schema: { type: "string", default: "1" },
                    },
                    {
                        name: "limit",
                        in: "query",
                        schema: { type: "string", default: "10" },
                    },
                    { name: "search", in: "query", schema: { type: "string" } },
                ],
                responses: {
                    200: {
                        description: "Roles retrieved successfully",
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
                                                data: {
                                                    type: "array",
                                                    items: {
                                                        type: "object",
                                                    },
                                                },
                                                pagination: {
                                                    type: "object",
                                                    properties: {
                                                        total: {
                                                            type: "number",
                                                        },
                                                        page: {
                                                            type: "number",
                                                        },
                                                        limit: {
                                                            type: "number",
                                                        },
                                                        totalPages: {
                                                            type: "number",
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
                    401: { description: "Unauthorized" },
                },
            },
        },
        "/roles/{id}": {
            get: {
                summary: "Get role by ID",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "org_id",
                        in: "header",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        description: "Organization ID",
                    },
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                    },
                ],
                responses: {
                    200: {
                        description: "Role retrieved successfully",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: {
                                            type: "string",
                                            example: "success",
                                        },
                                        data: { type: "object" },
                                    },
                                },
                            },
                        },
                    },
                    401: { description: "Unauthorized" },
                    404: { description: "Role not found" },
                },
            },
            put: {
                summary: "Update a role",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "org_id",
                        in: "header",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        description: "Organization ID",
                    },
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    name: {
                                        type: "string",
                                        minLength: 2,
                                        maxLength: 255,
                                    },
                                    description: {
                                        type: "string",
                                        maxLength: 1000,
                                    },
                                    permissionIds: {
                                        type: "array",
                                        items: {
                                            type: "string",
                                            format: "uuid",
                                        },
                                    },
                                    isActive: { type: "boolean" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Role updated successfully",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: {
                                            type: "string",
                                            example: "success",
                                        },
                                        data: { type: "object" },
                                    },
                                },
                            },
                        },
                    },
                    400: { description: "Bad Request" },
                    401: { description: "Unauthorized" },
                    404: { description: "Role not found" },
                },
            },
            delete: {
                summary: "Delete a role",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "org_id",
                        in: "header",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        description: "Organization ID",
                    },
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                    },
                ],
                responses: {
                    200: { description: "Role deleted successfully" },
                    401: { description: "Unauthorized" },
                    404: { description: "Role not found" },
                },
            },
        },
        "/roles/permissions/all": {
            get: {
                summary: "Get all permissions with pagination",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "org_id",
                        in: "header",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        description: "Organization ID",
                    },
                    {
                        name: "page",
                        in: "query",
                        schema: { type: "string", default: "1" },
                    },
                    {
                        name: "limit",
                        in: "query",
                        schema: { type: "string", default: "10" },
                    },
                    { name: "search", in: "query", schema: { type: "string" } },
                ],
                responses: {
                    200: {
                        description: "Permissions retrieved successfully",
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
                                                data: {
                                                    type: "array",
                                                    items: {
                                                        type: "object",
                                                        properties: {
                                                            id: {
                                                                type: "string",
                                                                format: "uuid",
                                                            },
                                                            name: {
                                                                type: "string",
                                                            },
                                                            codename: {
                                                                type: "string",
                                                            },
                                                            description: {
                                                                type: "string",
                                                            },
                                                            isActive: {
                                                                type: "boolean",
                                                            },
                                                        },
                                                    },
                                                },
                                                pagination: {
                                                    type: "object",
                                                    properties: {
                                                        total: {
                                                            type: "number",
                                                        },
                                                        page: {
                                                            type: "number",
                                                        },
                                                        limit: {
                                                            type: "number",
                                                        },
                                                        totalPages: {
                                                            type: "number",
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
                    401: { description: "Unauthorized" },
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
