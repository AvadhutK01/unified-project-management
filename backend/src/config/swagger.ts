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
        "/organizations/members/project/{projectId}": {
            get: {
                summary: "Get list of members assigned to a specific project",
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
                        name: "projectId",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        description: "Project ID",
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
                    200: {
                        description:
                            "List of project members retrieved successfully",
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
                                                            memberId: {
                                                                type: "string",
                                                                format: "uuid",
                                                            },
                                                            userId: {
                                                                type: "string",
                                                                format: "uuid",
                                                            },
                                                            name: {
                                                                type: "string",
                                                            },
                                                            email: {
                                                                type: "string",
                                                                format: "email",
                                                            },
                                                        },
                                                    },
                                                },
                                                pagination: {
                                                    type: "object",
                                                    properties: {
                                                        total: {
                                                            type: "integer",
                                                        },
                                                        page: {
                                                            type: "integer",
                                                        },
                                                        limit: {
                                                            type: "integer",
                                                        },
                                                        totalPages: {
                                                            type: "integer",
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
                    404: { description: "Project not found" },
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
        "/projects": {
            post: {
                summary: "Create a new project",
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
                        "multipart/form-data": {
                            schema: {
                                type: "object",
                                required: ["title"],
                                properties: {
                                    title: { type: "string", maxLength: 255 },
                                    description: {
                                        type: "string",
                                        maxLength: 2000,
                                    },
                                    startDate: {
                                        type: "string",
                                        pattern: "^\\d{4}-\\d{2}-\\d{2}$",
                                    },
                                    endDate: {
                                        type: "string",
                                        pattern: "^\\d{4}-\\d{2}-\\d{2}$",
                                    },
                                    clientName: {
                                        type: "string",
                                        maxLength: 255,
                                    },
                                    logo: { type: "string", format: "binary" },
                                    status: {
                                        type: "string",
                                        enum: [
                                            "notstarted",
                                            "started",
                                            "onhold",
                                            "completed",
                                        ],
                                    },
                                    memberIds: {
                                        type: "array",
                                        items: {
                                            type: "string",
                                            format: "uuid",
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: { description: "Project created successfully" },
                    400: { description: "Bad Request" },
                    401: { description: "Unauthorized" },
                },
            },
            get: {
                summary: "Get all projects with pagination",
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
                    200: { description: "List of projects" },
                    401: { description: "Unauthorized" },
                },
            },
        },
        "/projects/{id}": {
            get: {
                summary: "Get project by ID",
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
                    200: { description: "Project details" },
                    401: { description: "Unauthorized" },
                    404: { description: "Project not found" },
                },
            },
            put: {
                summary: "Update project details",
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
                        "multipart/form-data": {
                            schema: {
                                type: "object",
                                properties: {
                                    title: { type: "string", maxLength: 255 },
                                    description: {
                                        type: "string",
                                        maxLength: 2000,
                                        nullable: true,
                                    },
                                    startDate: {
                                        type: "string",
                                        pattern: "^\\d{4}-\\d{2}-\\d{2}$",
                                        nullable: true,
                                    },
                                    endDate: {
                                        type: "string",
                                        pattern: "^\\d{4}-\\d{2}-\\d{2}$",
                                        nullable: true,
                                    },
                                    clientName: {
                                        type: "string",
                                        maxLength: 255,
                                        nullable: true,
                                    },
                                    logo: { type: "string", format: "binary" },
                                    status: {
                                        type: "string",
                                        enum: [
                                            "notstarted",
                                            "started",
                                            "onhold",
                                            "completed",
                                        ],
                                    },
                                    memberIds: {
                                        type: "array",
                                        items: {
                                            type: "string",
                                            format: "uuid",
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: "Project updated successfully" },
                    400: { description: "Bad Request" },
                    401: { description: "Unauthorized" },
                    404: { description: "Project not found" },
                },
            },
            delete: {
                summary: "Soft delete a project",
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
                    200: { description: "Project deleted successfully" },
                    401: { description: "Unauthorized" },
                    404: { description: "Project not found" },
                },
            },
        },
        "/projects/{id}/members": {
            post: {
                summary: "Add a member to a project",
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
                                required: ["userId"],
                                properties: {
                                    userId: { type: "string", format: "uuid" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: { description: "Project member added successfully" },
                    400: { description: "Bad Request" },
                    401: { description: "Unauthorized" },
                    404: { description: "Project not found" },
                },
            },
            get: {
                summary: "Get list of members of a project",
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
                    200: { description: "List of project members" },
                    401: { description: "Unauthorized" },
                    404: { description: "Project not found" },
                },
            },
        },
        "/projects/{id}/members/{userId}": {
            delete: {
                summary: "Remove a member from a project",
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
                    {
                        name: "userId",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                    },
                ],
                responses: {
                    200: { description: "Project member removed successfully" },
                    400: { description: "Bad Request" },
                    401: { description: "Unauthorized" },
                    404: { description: "Project or member not found" },
                },
            },
        },
        "/phases": {
            post: {
                summary: "Create a new phase",
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
                                required: ["projectId", "name"],
                                properties: {
                                    projectId: {
                                        type: "string",
                                        format: "uuid",
                                    },
                                    name: { type: "string", maxLength: 255 },
                                    description: {
                                        type: "string",
                                        maxLength: 2000,
                                    },
                                    type: { type: "string", maxLength: 255 },
                                    startDate: {
                                        type: "string",
                                        pattern: "^\\d{4}-\\d{2}-\\d{2}$",
                                    },
                                    endDate: {
                                        type: "string",
                                        pattern: "^\\d{4}-\\d{2}-\\d{2}$",
                                    },
                                    status: {
                                        type: "string",
                                        enum: [
                                            "notstarted",
                                            "started",
                                            "onhold",
                                            "completed",
                                        ],
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: { description: "Phase created successfully" },
                    400: { description: "Bad Request" },
                    401: { description: "Unauthorized" },
                },
            },
            get: {
                summary: "Get all phases for a project",
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
                        name: "projectId",
                        in: "query",
                        required: true,
                        schema: { type: "string", format: "uuid" },
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
                    { name: "search", in: "query", schema: { type: "string" } },
                ],
                responses: {
                    200: { description: "List of phases" },
                    401: { description: "Unauthorized" },
                },
            },
        },
        "/phases/{id}": {
            get: {
                summary: "Get phase by ID",
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
                    200: { description: "Phase details" },
                    401: { description: "Unauthorized" },
                    404: { description: "Phase not found" },
                },
            },
            put: {
                summary: "Update phase details",
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
                                    name: { type: "string", maxLength: 255 },
                                    description: {
                                        type: "string",
                                        maxLength: 2000,
                                        nullable: true,
                                    },
                                    type: {
                                        type: "string",
                                        maxLength: 255,
                                        nullable: true,
                                    },
                                    startDate: {
                                        type: "string",
                                        pattern: "^\\d{4}-\\d{2}-\\d{2}$",
                                        nullable: true,
                                    },
                                    endDate: {
                                        type: "string",
                                        pattern: "^\\d{4}-\\d{2}-\\d{2}$",
                                        nullable: true,
                                    },
                                    status: {
                                        type: "string",
                                        enum: [
                                            "notstarted",
                                            "started",
                                            "onhold",
                                            "completed",
                                        ],
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: "Phase updated successfully" },
                    400: { description: "Bad Request" },
                    401: { description: "Unauthorized" },
                    404: { description: "Phase not found" },
                },
            },
            delete: {
                summary: "Soft delete a phase",
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
                    200: { description: "Phase deleted successfully" },
                    401: { description: "Unauthorized" },
                    404: { description: "Phase not found" },
                },
            },
        },
        "/sprints": {
            post: {
                summary: "Create a new sprint",
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
                                required: ["phaseId", "title"],
                                properties: {
                                    phaseId: { type: "string", format: "uuid" },
                                    title: { type: "string", maxLength: 255 },
                                    description: {
                                        type: "string",
                                        maxLength: 2000,
                                    },
                                    startDate: {
                                        type: "string",
                                        pattern: "^\\d{4}-\\d{2}-\\d{2}$",
                                    },
                                    endDate: {
                                        type: "string",
                                        pattern: "^\\d{4}-\\d{2}-\\d{2}$",
                                    },
                                    sequence: { type: "integer" },
                                    acceptanceCriteria: {
                                        type: "string",
                                        maxLength: 5000,
                                    },
                                    status: {
                                        type: "string",
                                        enum: [
                                            "new",
                                            "active",
                                            "onhold",
                                            "removed",
                                            "closed",
                                        ],
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: { description: "Sprint created successfully" },
                    400: { description: "Bad Request" },
                    401: { description: "Unauthorized" },
                },
            },
            get: {
                summary: "Get all sprints for a phase",
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
                        name: "phaseId",
                        in: "query",
                        required: true,
                        schema: { type: "string", format: "uuid" },
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
                    { name: "search", in: "query", schema: { type: "string" } },
                ],
                responses: {
                    200: { description: "List of sprints" },
                    401: { description: "Unauthorized" },
                },
            },
        },
        "/sprints/{id}": {
            get: {
                summary: "Get sprint by ID",
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
                    200: { description: "Sprint details" },
                    401: { description: "Unauthorized" },
                    404: { description: "Sprint not found" },
                },
            },
            put: {
                summary: "Update sprint details",
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
                                    title: { type: "string", maxLength: 255 },
                                    description: {
                                        type: "string",
                                        maxLength: 2000,
                                        nullable: true,
                                    },
                                    startDate: {
                                        type: "string",
                                        pattern: "^\\d{4}-\\d{2}-\\d{2}$",
                                        nullable: true,
                                    },
                                    endDate: {
                                        type: "string",
                                        pattern: "^\\d{4}-\\d{2}-\\d{2}$",
                                        nullable: true,
                                    },
                                    sequence: {
                                        type: "integer",
                                        nullable: true,
                                    },
                                    acceptanceCriteria: {
                                        type: "string",
                                        maxLength: 5000,
                                        nullable: true,
                                    },
                                    status: {
                                        type: "string",
                                        enum: [
                                            "new",
                                            "active",
                                            "onhold",
                                            "removed",
                                            "closed",
                                        ],
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: "Sprint updated successfully" },
                    400: { description: "Bad Request" },
                    401: { description: "Unauthorized" },
                    404: { description: "Sprint not found" },
                },
            },
            delete: {
                summary: "Soft delete a sprint",
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
                    200: { description: "Sprint deleted successfully" },
                    401: { description: "Unauthorized" },
                    404: { description: "Sprint not found" },
                },
            },
        },
        "/sprints/{id}/status": {
            patch: {
                summary: "Update sprint status",
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
                                required: ["status"],
                                properties: {
                                    status: {
                                        type: "string",
                                        enum: [
                                            "new",
                                            "active",
                                            "onhold",
                                            "removed",
                                            "closed",
                                        ],
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: "Sprint status updated successfully" },
                    400: { description: "Bad Request" },
                    401: { description: "Unauthorized" },
                    404: { description: "Sprint not found" },
                },
            },
        },
        "/sprints/{id}/activities": {
            get: {
                summary: "Get activity logs for a sprint",
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
                    200: { description: "List of sprint activity logs" },
                    401: { description: "Unauthorized" },
                    404: { description: "Sprint not found" },
                },
            },
        },
        "/sprints/{sprintId}/discussions": {
            post: {
                summary: "Add a discussion comment to a sprint",
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
                        name: "sprintId",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        description: "Sprint ID",
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["comment"],
                                properties: {
                                    comment: { type: "string" },
                                    taggedMemberIds: {
                                        type: "array",
                                        items: {
                                            type: "string",
                                            format: "uuid",
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: "Discussion comment created successfully",
                    },
                    400: { description: "Bad Request" },
                    401: { description: "Unauthorized" },
                    404: { description: "Sprint not found" },
                },
            },
            get: {
                summary: "Get list of discussion comments on a sprint",
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
                        name: "sprintId",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        description: "Sprint ID",
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
                ],
                responses: {
                    200: { description: "List of sprint discussion comments" },
                    401: { description: "Unauthorized" },
                    404: { description: "Sprint not found" },
                },
            },
        },
        "/sprints/{sprintId}/discussions/{discussionId}": {
            put: {
                summary: "Update a discussion comment",
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
                        name: "sprintId",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        description: "Sprint ID",
                    },
                    {
                        name: "discussionId",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        description: "Discussion ID",
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["comment"],
                                properties: {
                                    comment: { type: "string" },
                                    taggedMemberIds: {
                                        type: "array",
                                        items: {
                                            type: "string",
                                            format: "uuid",
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Discussion comment updated successfully",
                    },
                    400: { description: "Bad Request" },
                    401: { description: "Unauthorized" },
                    403: { description: "Forbidden" },
                    404: { description: "Discussion not found" },
                },
            },
            delete: {
                summary: "Delete a discussion comment",
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
                        name: "sprintId",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        description: "Sprint ID",
                    },
                    {
                        name: "discussionId",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        description: "Discussion ID",
                    },
                ],
                responses: {
                    200: {
                        description: "Discussion comment deleted successfully",
                    },
                    401: { description: "Unauthorized" },
                    403: { description: "Forbidden" },
                    404: { description: "Discussion not found" },
                },
            },
        },
        "/sprints/{sprintId}/media": {
            post: {
                summary: "Upload a sprint media attachment",
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
                        name: "sprintId",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        description: "Sprint ID",
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "multipart/form-data": {
                            schema: {
                                type: "object",
                                required: ["file"],
                                properties: {
                                    file: { type: "string", format: "binary" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: "Media attachment uploaded successfully",
                    },
                    400: { description: "Bad Request" },
                    401: { description: "Unauthorized" },
                    404: { description: "Sprint not found" },
                },
            },
            get: {
                summary: "Get list of media attachments on a sprint",
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
                        name: "sprintId",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        description: "Sprint ID",
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
                        description: "Search keyword for file name",
                    },
                ],
                responses: {
                    200: { description: "List of sprint media attachments" },
                    401: { description: "Unauthorized" },
                    404: { description: "Sprint not found" },
                },
            },
        },
        "/sprints/{sprintId}/media/{mediaId}": {
            delete: {
                summary: "Delete a sprint media attachment",
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
                        name: "sprintId",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        description: "Sprint ID",
                    },
                    {
                        name: "mediaId",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        description: "Media ID",
                    },
                ],
                responses: {
                    200: {
                        description: "Media attachment deleted successfully",
                    },
                    401: { description: "Unauthorized" },
                    403: { description: "Forbidden" },
                    404: { description: "Sprint media attachment not found" },
                },
            },
        },
        "/workitems": {
            post: {
                summary: "Create a new workitem",
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
                                required: ["sprintId", "title", "workitemType"],
                                properties: {
                                    sprintId: {
                                        type: "string",
                                        format: "uuid",
                                    },
                                    assignedTo: {
                                        type: "string",
                                        format: "uuid",
                                        nullable: true,
                                    },
                                    title: { type: "string" },
                                    description: {
                                        type: "string",
                                        nullable: true,
                                    },
                                    status: {
                                        type: "string",
                                        enum: [
                                            "new",
                                            "active",
                                            "resolved",
                                            "closed",
                                            "removed",
                                            "onhold",
                                        ],
                                    },
                                    priority: { type: "integer", default: 2 },
                                    acceptanceCriteria: {
                                        type: "string",
                                        nullable: true,
                                    },
                                    workitemType: {
                                        type: "string",
                                        enum: ["task", "bug"],
                                    },
                                    originalEstimation: {
                                        type: "number",
                                        nullable: true,
                                    },
                                    remaining: {
                                        type: "number",
                                        nullable: true,
                                    },
                                    completed: {
                                        type: "number",
                                        nullable: true,
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: { description: "Workitem created successfully" },
                    400: { description: "Bad Request" },
                    401: { description: "Unauthorized" },
                },
            },
            get: {
                summary: "Get all workitems for a sprint",
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
                        name: "sprintId",
                        in: "query",
                        required: true,
                        schema: { type: "string", format: "uuid" },
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
                    { name: "search", in: "query", schema: { type: "string" } },
                ],
                responses: {
                    200: { description: "List of workitems" },
                    401: { description: "Unauthorized" },
                },
            },
        },
        "/workitems/{id}": {
            get: {
                summary: "Get a workitem by ID",
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
                        description: "Workitem ID",
                    },
                ],
                responses: {
                    200: { description: "Workitem details" },
                    401: { description: "Unauthorized" },
                    404: { description: "Not found" },
                },
            },
            put: {
                summary: "Update a workitem",
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
                        description: "Workitem ID",
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    assignedTo: {
                                        type: "string",
                                        format: "uuid",
                                        nullable: true,
                                    },
                                    title: { type: "string" },
                                    description: {
                                        type: "string",
                                        nullable: true,
                                    },
                                    status: {
                                        type: "string",
                                        enum: [
                                            "new",
                                            "active",
                                            "resolved",
                                            "closed",
                                            "removed",
                                            "onhold",
                                        ],
                                    },
                                    priority: { type: "integer" },
                                    acceptanceCriteria: {
                                        type: "string",
                                        nullable: true,
                                    },
                                    workitemType: {
                                        type: "string",
                                        enum: ["task", "bug"],
                                    },
                                    originalEstimation: {
                                        type: "number",
                                        nullable: true,
                                    },
                                    remaining: {
                                        type: "number",
                                        nullable: true,
                                    },
                                    completed: {
                                        type: "number",
                                        nullable: true,
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: "Workitem updated successfully" },
                    400: { description: "Bad Request" },
                    401: { description: "Unauthorized" },
                    404: { description: "Not found" },
                },
            },
            delete: {
                summary: "Delete a workitem",
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
                        description: "Workitem ID",
                    },
                ],
                responses: {
                    200: { description: "Workitem deleted successfully" },
                    401: { description: "Unauthorized" },
                    404: { description: "Not found" },
                },
            },
        },
        "/workitems/{id}/status": {
            put: {
                summary: "Update workitem status",
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
                        description: "Workitem ID",
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
                                        enum: [
                                            "new",
                                            "active",
                                            "resolved",
                                            "closed",
                                            "removed",
                                            "onhold",
                                        ],
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Workitem status updated successfully",
                    },
                    400: { description: "Bad Request" },
                    401: { description: "Unauthorized" },
                    404: { description: "Not found" },
                },
            },
        },
        "/workitems/{id}/activities": {
            get: {
                summary: "Get workitem activity logs",
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
                        description: "Workitem ID",
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
                ],
                responses: {
                    200: { description: "List of workitem activity logs" },
                    401: { description: "Unauthorized" },
                    404: { description: "Workitem not found" },
                },
            },
        },
        "/workitems/{workitemId}/discussions": {
            post: {
                summary: "Add a discussion comment to a workitem",
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
                        name: "workitemId",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        description: "Workitem ID",
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["content"],
                                properties: {
                                    content: { type: "string" },
                                    taggedMembers: {
                                        type: "array",
                                        items: {
                                            type: "string",
                                            format: "uuid",
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: "Discussion comment added successfully",
                    },
                    400: { description: "Bad Request" },
                    401: { description: "Unauthorized" },
                },
            },
            get: {
                summary: "Get discussion comments for a workitem",
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
                        name: "workitemId",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        description: "Workitem ID",
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
                ],
                responses: {
                    200: {
                        description: "List of workitem discussion comments",
                    },
                    401: { description: "Unauthorized" },
                    404: { description: "Workitem not found" },
                },
            },
        },
        "/workitems/{workitemId}/discussions/{discussionId}": {
            delete: {
                summary: "Delete a workitem discussion comment",
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
                        name: "workitemId",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        description: "Workitem ID",
                    },
                    {
                        name: "discussionId",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        description: "Discussion ID",
                    },
                ],
                responses: {
                    200: {
                        description: "Discussion comment deleted successfully",
                    },
                    401: { description: "Unauthorized" },
                    403: { description: "Forbidden" },
                    404: { description: "Discussion not found" },
                },
            },
        },
        "/workitems/{workitemId}/media": {
            post: {
                summary: "Upload media to a workitem",
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
                        name: "workitemId",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        description: "Workitem ID",
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "multipart/form-data": {
                            schema: {
                                type: "object",
                                required: ["files"],
                                properties: {
                                    files: {
                                        type: "array",
                                        items: {
                                            type: "string",
                                            format: "binary",
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: { description: "Media uploaded successfully" },
                    400: { description: "Bad Request" },
                    401: { description: "Unauthorized" },
                    404: { description: "Workitem not found" },
                },
            },
            get: {
                summary: "Get media list for a workitem",
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
                        name: "workitemId",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        description: "Workitem ID",
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
                        description: "Search keyword for file name",
                    },
                ],
                responses: {
                    200: { description: "List of workitem media attachments" },
                    401: { description: "Unauthorized" },
                    404: { description: "Workitem not found" },
                },
            },
        },
        "/workitems/{workitemId}/media/{mediaId}": {
            delete: {
                summary: "Delete a workitem media attachment",
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
                        name: "workitemId",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        description: "Workitem ID",
                    },
                    {
                        name: "mediaId",
                        in: "path",
                        required: true,
                        schema: { type: "string", format: "uuid" },
                        description: "Media ID",
                    },
                ],
                responses: {
                    200: {
                        description: "Media attachment deleted successfully",
                    },
                    401: { description: "Unauthorized" },
                    403: { description: "Forbidden" },
                    404: { description: "Workitem media attachment not found" },
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
