export const projectSwaggerPaths = {
    "/projects": {
        post: {
            summary: "Create a new project",
            security: [
                {
                    bearerAuth: [],
                },
            ],
            parameters: [
                {
                    name: "org_id",
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
                            required: ["title"],
                            properties: {
                                title: {
                                    type: "string",
                                    maxLength: 255,
                                },
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
                                logo: {
                                    type: "string",
                                    format: "binary",
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
                "201": {
                    description: "Project created successfully",
                },
                "400": {
                    description: "Bad Request",
                },
                "401": {
                    description: "Unauthorized",
                },
            },
        },
        get: {
            summary: "Get all projects with pagination",
            security: [
                {
                    bearerAuth: [],
                },
            ],
            parameters: [
                {
                    name: "org_id",
                    in: "header",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                    },
                    description: "Organization ID",
                },
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
                {
                    name: "search",
                    in: "query",
                    schema: {
                        type: "string",
                    },
                },
            ],
            responses: {
                "200": {
                    description: "List of projects",
                },
                "401": {
                    description: "Unauthorized",
                },
            },
        },
    },
    "/projects/{id}": {
        get: {
            summary: "Get project by ID",
            security: [
                {
                    bearerAuth: [],
                },
            ],
            parameters: [
                {
                    name: "org_id",
                    in: "header",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                    },
                    description: "Organization ID",
                },
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
                    description: "Project details",
                },
                "401": {
                    description: "Unauthorized",
                },
                "404": {
                    description: "Project not found",
                },
            },
        },
        put: {
            summary: "Update project details",
            security: [
                {
                    bearerAuth: [],
                },
            ],
            parameters: [
                {
                    name: "org_id",
                    in: "header",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                    },
                    description: "Organization ID",
                },
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
            requestBody: {
                required: true,
                content: {
                    "multipart/form-data": {
                        schema: {
                            type: "object",
                            properties: {
                                title: {
                                    type: "string",
                                    maxLength: 255,
                                },
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
                                logo: {
                                    type: "string",
                                    format: "binary",
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
                "200": {
                    description: "Project updated successfully",
                },
                "400": {
                    description: "Bad Request",
                },
                "401": {
                    description: "Unauthorized",
                },
                "404": {
                    description: "Project not found",
                },
            },
        },
        delete: {
            summary: "Soft delete a project",
            security: [
                {
                    bearerAuth: [],
                },
            ],
            parameters: [
                {
                    name: "org_id",
                    in: "header",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                    },
                    description: "Organization ID",
                },
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
                    description: "Project deleted successfully",
                },
                "401": {
                    description: "Unauthorized",
                },
                "404": {
                    description: "Project not found",
                },
            },
        },
    },
    "/projects/{id}/members": {
        post: {
            summary: "Add a member to a project",
            security: [
                {
                    bearerAuth: [],
                },
            ],
            parameters: [
                {
                    name: "org_id",
                    in: "header",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                    },
                    description: "Organization ID",
                },
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
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["userId"],
                            properties: {
                                userId: {
                                    type: "string",
                                    format: "uuid",
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                "201": {
                    description: "Project member added successfully",
                },
                "400": {
                    description: "Bad Request",
                },
                "401": {
                    description: "Unauthorized",
                },
                "404": {
                    description: "Project not found",
                },
            },
        },
        get: {
            summary: "Get list of members of a project",
            security: [
                {
                    bearerAuth: [],
                },
            ],
            parameters: [
                {
                    name: "org_id",
                    in: "header",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                    },
                    description: "Organization ID",
                },
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
                    description: "List of project members",
                },
                "401": {
                    description: "Unauthorized",
                },
                "404": {
                    description: "Project not found",
                },
            },
        },
    },
    "/projects/{id}/members/{userId}": {
        delete: {
            summary: "Remove a member from a project",
            security: [
                {
                    bearerAuth: [],
                },
            ],
            parameters: [
                {
                    name: "org_id",
                    in: "header",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                    },
                    description: "Organization ID",
                },
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                    },
                },
                {
                    name: "userId",
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
                    description: "Project member removed successfully",
                },
                "400": {
                    description: "Bad Request",
                },
                "401": {
                    description: "Unauthorized",
                },
                "404": {
                    description: "Project or member not found",
                },
            },
        },
    },
};
