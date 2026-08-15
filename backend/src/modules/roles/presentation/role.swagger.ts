export const roleSwaggerPaths = {
    "/roles": {
        post: {
            summary: "Create a new role",
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
                                isActive: {
                                    type: "boolean",
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                "201": {
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
                                            name: {
                                                type: "string",
                                            },
                                            description: {
                                                type: "string",
                                            },
                                            isActive: {
                                                type: "boolean",
                                            },
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
                "400": {
                    description: "Bad Request",
                },
                "401": {
                    description: "Unauthorized",
                },
            },
        },
        get: {
            summary: "Get all roles with pagination",
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
                        type: "string",
                        default: "1",
                    },
                },
                {
                    name: "limit",
                    in: "query",
                    schema: {
                        type: "string",
                        default: "10",
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
                "401": {
                    description: "Unauthorized",
                },
            },
        },
    },
    "/roles/{id}": {
        get: {
            summary: "Get role by ID",
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
                                    data: {
                                        type: "object",
                                    },
                                },
                            },
                        },
                    },
                },
                "401": {
                    description: "Unauthorized",
                },
                "404": {
                    description: "Role not found",
                },
            },
        },
        put: {
            summary: "Update a role",
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
                                isActive: {
                                    type: "boolean",
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                "200": {
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
                                    data: {
                                        type: "object",
                                    },
                                },
                            },
                        },
                    },
                },
                "400": {
                    description: "Bad Request",
                },
                "401": {
                    description: "Unauthorized",
                },
                "404": {
                    description: "Role not found",
                },
            },
        },
        delete: {
            summary: "Delete a role",
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
                    description: "Role deleted successfully",
                },
                "401": {
                    description: "Unauthorized",
                },
                "404": {
                    description: "Role not found",
                },
            },
        },
    },
    "/roles/permissions/all": {
        get: {
            summary: "Get all permissions with pagination",
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
                        type: "string",
                        default: "1",
                    },
                },
                {
                    name: "limit",
                    in: "query",
                    schema: {
                        type: "string",
                        default: "10",
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
                "401": {
                    description: "Unauthorized",
                },
            },
        },
    },
};
