export const chatSwaggerPaths = {
    "/members/chat/{recipientId}": {
        get: {
            summary: "Get direct chat history with a member (Pro/Premium)",
            security: [
                {
                    bearerAuth: [],
                },
            ],
            parameters: [
                {
                    name: "x-organization-id",
                    in: "header",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                    },
                    description: "Organization ID",
                },
                {
                    name: "recipientId",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                    },
                    description: "Recipient User ID or Member ID",
                },
                {
                    name: "page",
                    in: "query",
                    schema: {
                        type: "integer",
                        default: 1,
                    },
                    description: "Page number for pagination",
                },
                {
                    name: "limit",
                    in: "query",
                    schema: {
                        type: "integer",
                        default: 10,
                    },
                    description: "Batch size limit per page",
                },
            ],
            responses: {
                "200": {
                    description:
                        "Direct chat messages history and pagination metadata",
                },
                "401": {
                    description: "Unauthorized",
                },
                "403": {
                    description: "Forbidden - Requires Pro or Premium plan",
                },
            },
        },
    },
    "/members/chat/read/{senderId}": {
        post: {
            summary: "Mark direct messages from a sender as read",
            security: [
                {
                    bearerAuth: [],
                },
            ],
            parameters: [
                {
                    name: "x-organization-id",
                    in: "header",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                    },
                    description: "Organization ID",
                },
                {
                    name: "senderId",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                    },
                    description: "Sender User ID or Member ID",
                },
            ],
            responses: {
                "200": {
                    description: "Messages marked as read successfully",
                },
                "401": {
                    description: "Unauthorized",
                },
                "403": {
                    description: "Forbidden - Requires Pro or Premium plan",
                },
            },
        },
    },
    "/members/chat/upload": {
        post: {
            summary: "Upload an attachment file for direct chat",
            security: [
                {
                    bearerAuth: [],
                },
            ],
            parameters: [
                {
                    name: "x-organization-id",
                    in: "header",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                    },
                    description: "Organization ID",
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
                                file: {
                                    type: "string",
                                    format: "binary",
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                "200": {
                    description: "File uploaded successfully to S3",
                },
                "400": {
                    description: "Bad Request - No file uploaded",
                },
                "401": {
                    description: "Unauthorized",
                },
                "403": {
                    description: "Forbidden - Requires Pro or Premium plan",
                },
            },
        },
    },
};
