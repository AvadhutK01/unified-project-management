export const organizationSwaggerPaths = {
    "/organizations": {
        post: {
            summary: "Create a new organization",
            security: [
                {
                    bearerAuth: [],
                },
            ],
            requestBody: {
                required: true,
                content: {
                    "multipart/form-data": {
                        schema: {
                            type: "object",
                            required: ["name", "slug"],
                            properties: {
                                name: {
                                    type: "string",
                                },
                                slug: {
                                    type: "string",
                                },
                                logo: {
                                    type: "string",
                                    format: "binary",
                                },
                                websiteUrl: {
                                    type: "string",
                                    format: "uri",
                                },
                                description: {
                                    type: "string",
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
                "201": {
                    description: "Organization created successfully",
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
            summary: "Get all organizations",
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
                    description: "List of all organizations",
                },
                "401": {
                    description: "Unauthorized",
                },
            },
        },
    },
    "/organizations/mine": {
        get: {
            summary: "Get organizations owned by the authenticated user",
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
                    description: "List of user's organizations",
                },
                "401": {
                    description: "Unauthorized",
                },
            },
        },
    },
    "/organizations/{id}": {
        get: {
            summary: "Get an organization by ID",
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
                    description: "Organization details",
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
            summary: "Update an organization (owner only)",
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
            requestBody: {
                required: true,
                content: {
                    "multipart/form-data": {
                        schema: {
                            type: "object",
                            properties: {
                                name: {
                                    type: "string",
                                },
                                slug: {
                                    type: "string",
                                },
                                logo: {
                                    type: "string",
                                    format: "binary",
                                },
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
                "200": {
                    description: "Organization updated successfully",
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
                    description: "Not found",
                },
            },
        },
        delete: {
            summary: "Delete an organization (owner only)",
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
                    description: "Organization deleted successfully",
                },
                "401": {
                    description: "Unauthorized",
                },
                "403": {
                    description: "Forbidden",
                },
            },
        },
    },
    "/organizations/members/invite": {
        post: {
            summary: "Invite members to an organization",
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
                "201": {
                    description: "Members invited successfully",
                },
                "400": {
                    description: "Bad Request",
                },
                "401": {
                    description: "Unauthorized",
                },
            },
        },
    },
    "/organizations/invitations": {
        get: {
            summary: "Get pending invitations for the authenticated user",
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
                    description: "List of pending invitations",
                },
                "401": {
                    description: "Unauthorized",
                },
            },
        },
    },
    "/organizations/invitations/{id}": {
        delete: {
            summary: "Revoke a pending invitation",
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
                    description: "Invitation ID",
                },
            ],
            responses: {
                "200": {
                    description: "Invitation revoked successfully",
                },
                "400": {
                    description: "Bad Request",
                },
                "401": {
                    description: "Unauthorized",
                },
                "404": {
                    description: "Invitation not found",
                },
            },
        },
    },
    "/organizations/invitations/{id}/status": {
        put: {
            summary: "Update invitation status (accept/reject)",
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
                "200": {
                    description: "Invitation status updated successfully",
                },
                "400": {
                    description: "Bad Request",
                },
                "401": {
                    description: "Unauthorized",
                },
                "404": {
                    description: "Not Found",
                },
            },
        },
    },
    "/organizations/members": {
        get: {
            summary: "Get organization members list",
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
                    name: "type",
                    in: "query",
                    required: true,
                    schema: {
                        type: "string",
                        enum: ["invited", "joined"],
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
                    description: "Search keyword for username or email",
                },
                {
                    name: "isForProject",
                    in: "query",
                    schema: {
                        type: "boolean",
                    },
                    description:
                        "Whether to exclude the organization owner and current user",
                },
            ],
            responses: {
                "200": {
                    description: "List of members or invited users",
                },
                "401": {
                    description: "Unauthorized",
                },
            },
        },
    },
    "/organizations/members/project/{projectId}": {
        get: {
            summary: "Get list of members assigned to a specific project",
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
                    in: "path",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                    },
                    description: "Project ID",
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
                    description: "Search keyword for username or email",
                },
            ],
            responses: {
                "200": {
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
                "401": {
                    description: "Unauthorized",
                },
                "404": {
                    description: "Project not found",
                },
            },
        },
    },
    "/organizations/members/re-invite": {
        post: {
            summary: "Re-invite a previously rejected member",
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
            responses: {
                "200": {
                    description: "Member re-invited successfully",
                },
                "400": {
                    description: "Bad Request",
                },
                "401": {
                    description: "Unauthorized",
                },
            },
        },
    },
    "/organizations/members/me/role": {
        get: {
            summary:
                "Get current user's role and permissions inside an organization",
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
            responses: {
                "200": {
                    description:
                        "Current user's member role details retrieved successfully",
                },
                "401": {
                    description: "Unauthorized",
                },
            },
        },
    },
    "/organizations/members/me/toggle-leave": {
        patch: {
            summary:
                "Toggle the current user's leave status in the organization",
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
            responses: {
                "200": {
                    description: "Leave status toggled successfully",
                },
                "400": {
                    description: "Bad Request",
                },
                "401": {
                    description: "Unauthorized",
                },
                "404": {
                    description: "Member not found",
                },
            },
        },
    },
    "/organizations/members/{id}": {
        get: {
            summary: "Get organization member details",
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
                    description: "Member ID",
                },
            ],
            responses: {
                "200": {
                    description: "Member details fetched successfully",
                },
                "400": {
                    description: "Bad Request",
                },
                "401": {
                    description: "Unauthorized",
                },
                "404": {
                    description: "Member not found",
                },
            },
        },
        put: {
            summary: "Edit organization member role and status",
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
                                roleId: {
                                    type: "string",
                                    format: "uuid",
                                },
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
                "200": {
                    description: "Member details updated successfully",
                },
                "400": {
                    description: "Bad Request",
                },
                "401": {
                    description: "Unauthorized",
                },
                "404": {
                    description: "Member not found",
                },
            },
        },
        delete: {
            summary: "Soft delete organization member",
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
                    description: "Member ID",
                },
            ],
            responses: {
                "200": {
                    description: "Member soft deleted successfully",
                },
                "400": {
                    description: "Bad Request",
                },
                "401": {
                    description: "Unauthorized",
                },
                "404": {
                    description: "Member not found",
                },
            },
        },
    },
};
