export const sprintSwaggerPaths = {
    "/sprints": {
        post: {
            summary: "Create a new sprint",
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
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["phaseId", "title"],
                            properties: {
                                phaseId: {
                                    type: "string",
                                    format: "uuid",
                                },
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
                                sequence: {
                                    type: "integer",
                                },
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
                "201": {
                    description: "Sprint created successfully",
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
            summary: "Get all sprints for a phase",
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
                    name: "phaseId",
                    in: "query",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                    },
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
                    description: "List of sprints",
                },
                "401": {
                    description: "Unauthorized",
                },
            },
        },
    },
    "/sprints/{id}": {
        get: {
            summary: "Get sprint by ID",
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
                    description: "Sprint details",
                },
                "401": {
                    description: "Unauthorized",
                },
                "404": {
                    description: "Sprint not found",
                },
            },
        },
        put: {
            summary: "Update sprint details",
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
                "200": {
                    description: "Sprint updated successfully",
                },
                "400": {
                    description: "Bad Request",
                },
                "401": {
                    description: "Unauthorized",
                },
                "404": {
                    description: "Sprint not found",
                },
            },
        },
        delete: {
            summary: "Soft delete a sprint",
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
                    description: "Sprint deleted successfully",
                },
                "401": {
                    description: "Unauthorized",
                },
                "404": {
                    description: "Sprint not found",
                },
            },
        },
    },
    "/sprints/{id}/status": {
        patch: {
            summary: "Update sprint status",
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
                "200": {
                    description: "Sprint status updated successfully",
                },
                "400": {
                    description: "Bad Request",
                },
                "401": {
                    description: "Unauthorized",
                },
                "404": {
                    description: "Sprint not found",
                },
            },
        },
    },
    "/sprints/{id}/activities": {
        get: {
            summary: "Get activity logs for a sprint",
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
                    description: "List of sprint activity logs",
                },
                "401": {
                    description: "Unauthorized",
                },
                "404": {
                    description: "Sprint not found",
                },
            },
        },
    },
    "/sprints/{sprintId}/discussions": {
        post: {
            summary: "Add a discussion comment to a sprint",
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
                    name: "sprintId",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                    },
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
                                comment: {
                                    type: "string",
                                },
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
                "201": {
                    description: "Discussion comment created successfully",
                },
                "400": {
                    description: "Bad Request",
                },
                "401": {
                    description: "Unauthorized",
                },
                "404": {
                    description: "Sprint not found",
                },
            },
        },
        get: {
            summary: "Get list of discussion comments on a sprint",
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
                    name: "sprintId",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                    },
                    description: "Sprint ID",
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
            ],
            responses: {
                "200": {
                    description: "List of sprint discussion comments",
                },
                "401": {
                    description: "Unauthorized",
                },
                "404": {
                    description: "Sprint not found",
                },
            },
        },
    },
    "/sprints/{sprintId}/discussions/{discussionId}": {
        put: {
            summary: "Update a discussion comment",
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
                    name: "sprintId",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                    },
                    description: "Sprint ID",
                },
                {
                    name: "discussionId",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                    },
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
                                comment: {
                                    type: "string",
                                },
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
                "200": {
                    description: "Discussion comment updated successfully",
                },
                "400": {
                    description: "Bad Request",
                },
                "401": {
                    description: "Unauthorized",
                },
                "403": {
                    description: "Forbidden",
                },
                "404": {
                    description: "Discussion not found",
                },
            },
        },
        delete: {
            summary: "Delete a discussion comment",
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
                    name: "sprintId",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                    },
                    description: "Sprint ID",
                },
                {
                    name: "discussionId",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                    },
                    description: "Discussion ID",
                },
            ],
            responses: {
                "200": {
                    description: "Discussion comment deleted successfully",
                },
                "401": {
                    description: "Unauthorized",
                },
                "403": {
                    description: "Forbidden",
                },
                "404": {
                    description: "Discussion not found",
                },
            },
        },
    },
    "/sprints/{sprintId}/media": {
        post: {
            summary: "Upload a sprint media attachment",
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
                    name: "sprintId",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                    },
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
                "201": {
                    description: "Media attachment uploaded successfully",
                },
                "400": {
                    description: "Bad Request",
                },
                "401": {
                    description: "Unauthorized",
                },
                "404": {
                    description: "Sprint not found",
                },
            },
        },
        get: {
            summary: "Get list of media attachments on a sprint",
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
                    name: "sprintId",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                    },
                    description: "Sprint ID",
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
                    description: "Search keyword for file name",
                },
            ],
            responses: {
                "200": {
                    description: "List of sprint media attachments",
                },
                "401": {
                    description: "Unauthorized",
                },
                "404": {
                    description: "Sprint not found",
                },
            },
        },
    },
    "/sprints/{sprintId}/media/{mediaId}": {
        delete: {
            summary: "Delete a sprint media attachment",
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
                    name: "sprintId",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                    },
                    description: "Sprint ID",
                },
                {
                    name: "mediaId",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                    },
                    description: "Media ID",
                },
            ],
            responses: {
                "200": {
                    description: "Media attachment deleted successfully",
                },
                "401": {
                    description: "Unauthorized",
                },
                "403": {
                    description: "Forbidden",
                },
                "404": {
                    description: "Sprint media attachment not found",
                },
            },
        },
    },
};
