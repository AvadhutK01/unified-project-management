export const phaseSwaggerPaths = {
    "/phases": {
        post: {
            summary: "Create a new phase",
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
                            required: ["projectId", "name"],
                            properties: {
                                projectId: {
                                    type: "string",
                                    format: "uuid",
                                },
                                name: {
                                    type: "string",
                                    maxLength: 255,
                                },
                                description: {
                                    type: "string",
                                    maxLength: 2000,
                                },
                                type: {
                                    type: "string",
                                    maxLength: 255,
                                },
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
                "201": {
                    description: "Phase created successfully",
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
            summary: "Get all phases for a project",
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
                    name: "projectId",
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
                    description: "List of phases",
                },
                "401": {
                    description: "Unauthorized",
                },
            },
        },
    },
    "/phases/{id}": {
        get: {
            summary: "Get phase by ID",
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
                    description: "Phase details",
                },
                "401": {
                    description: "Unauthorized",
                },
                "404": {
                    description: "Phase not found",
                },
            },
        },
        put: {
            summary: "Update phase details",
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
                                name: {
                                    type: "string",
                                    maxLength: 255,
                                },
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
                "200": {
                    description: "Phase updated successfully",
                },
                "400": {
                    description: "Bad Request",
                },
                "401": {
                    description: "Unauthorized",
                },
                "404": {
                    description: "Phase not found",
                },
            },
        },
        delete: {
            summary: "Soft delete a phase",
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
                    description: "Phase deleted successfully",
                },
                "401": {
                    description: "Unauthorized",
                },
                "404": {
                    description: "Phase not found",
                },
            },
        },
    },
};
