export const notificationSwaggerPaths = {
    "/notifications": {
        get: {
            summary: "Get notifications for authenticated user",
            tags: ["Notifications"],
            security: [
                {
                    bearerAuth: [],
                },
            ],
            parameters: [
                {
                    name: "page",
                    in: "query",
                    schema: {
                        type: "integer",
                        default: 1,
                    },
                },
                {
                    name: "limit",
                    in: "query",
                    schema: {
                        type: "integer",
                        default: 10,
                    },
                },
            ],
            responses: {
                "200": {
                    description: "Notifications list",
                },
                "401": {
                    description: "Unauthorized",
                },
            },
        },
    },
    "/notifications/{id}/read": {
        patch: {
            summary: "Mark notification as read",
            tags: ["Notifications"],
            security: [
                {
                    bearerAuth: [],
                },
            ],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                    },
                },
            ],
            responses: {
                "200": {
                    description: "Notification marked as read",
                },
                "401": {
                    description: "Unauthorized",
                },
                "404": {
                    description: "Notification not found",
                },
            },
        },
    },
    "/notifications/read-all": {
        post: {
            summary: "Mark all user notifications as read",
            tags: ["Notifications"],
            security: [
                {
                    bearerAuth: [],
                },
            ],
            responses: {
                "200": {
                    description: "All notifications marked as read",
                },
                "401": {
                    description: "Unauthorized",
                },
            },
        },
    },
};
