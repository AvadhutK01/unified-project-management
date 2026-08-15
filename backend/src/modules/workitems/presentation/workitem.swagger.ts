export const workitemSwaggerPaths = {
    "/workitems": {
        post: {
            summary: "Create a new workitem",
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
                                title: {
                                    type: "string",
                                },
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
                                priority: {
                                    type: "integer",
                                    default: 2,
                                },
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
                "201": {
                    description: "Workitem created successfully",
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
            summary: "Get all workitems for a sprint",
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
                    description: "List of workitems",
                },
                "401": {
                    description: "Unauthorized",
                },
            },
        },
    },
    "/workitems/{id}": {
        get: {
            summary: "Get a workitem by ID",
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
                    description: "Workitem ID",
                },
            ],
            responses: {
                "200": {
                    description: "Workitem details",
                },
                "401": {
                    description: "Unauthorized",
                },
                "404": {
                    description: "Not found",
                },
            },
        },
        put: {
            summary: "Update a workitem",
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
                                title: {
                                    type: "string",
                                },
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
                                priority: {
                                    type: "integer",
                                },
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
                "200": {
                    description: "Workitem updated successfully",
                },
                "400": {
                    description: "Bad Request",
                },
                "401": {
                    description: "Unauthorized",
                },
                "404": {
                    description: "Not found",
                },
            },
        },
        delete: {
            summary: "Delete a workitem",
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
                    description: "Workitem ID",
                },
            ],
            responses: {
                "200": {
                    description: "Workitem deleted successfully",
                },
                "401": {
                    description: "Unauthorized",
                },
                "404": {
                    description: "Not found",
                },
            },
        },
    },
    "/workitems/{id}/status": {
        put: {
            summary: "Update workitem status",
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
                "200": {
                    description: "Workitem status updated successfully",
                },
                "400": {
                    description: "Bad Request",
                },
                "401": {
                    description: "Unauthorized",
                },
                "404": {
                    description: "Not found",
                },
            },
        },
    },
    "/workitems/{id}/activities": {
        get: {
            summary: "Get workitem activity logs",
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
                    description: "Workitem ID",
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
                    description: "List of workitem activity logs",
                },
                "401": {
                    description: "Unauthorized",
                },
                "404": {
                    description: "Workitem not found",
                },
            },
        },
    },
    "/workitems/{workitemId}/discussions": {
        post: {
            summary: "Add a discussion comment to a workitem",
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
                    name: "workitemId",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                    },
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
                                content: {
                                    type: "string",
                                },
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
                "201": {
                    description: "Discussion comment added successfully",
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
            summary: "Get discussion comments for a workitem",
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
                    name: "workitemId",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                    },
                    description: "Workitem ID",
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
                    description: "List of workitem discussion comments",
                },
                "401": {
                    description: "Unauthorized",
                },
                "404": {
                    description: "Workitem not found",
                },
            },
        },
    },
    "/workitems/{workitemId}/discussions/{discussionId}": {
        delete: {
            summary: "Delete a workitem discussion comment",
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
                    name: "workitemId",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                    },
                    description: "Workitem ID",
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
    "/workitems/{workitemId}/media": {
        post: {
            summary: "Upload media to a workitem",
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
                    name: "workitemId",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                    },
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
                "201": {
                    description: "Media uploaded successfully",
                },
                "400": {
                    description: "Bad Request",
                },
                "401": {
                    description: "Unauthorized",
                },
                "404": {
                    description: "Workitem not found",
                },
            },
        },
        get: {
            summary: "Get media list for a workitem",
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
                    name: "workitemId",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                    },
                    description: "Workitem ID",
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
                    description: "List of workitem media attachments",
                },
                "401": {
                    description: "Unauthorized",
                },
                "404": {
                    description: "Workitem not found",
                },
            },
        },
    },
    "/workitems/{workitemId}/media/{mediaId}": {
        delete: {
            summary: "Delete a workitem media attachment",
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
                    name: "workitemId",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                    },
                    description: "Workitem ID",
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
                    description: "Workitem media attachment not found",
                },
            },
        },
    },
};
