export const dashboardSwaggerPaths = {
    "/dashboards/organizations": {
        get: {
            summary: "Get organization dashboard metrics",
            tags: ["Dashboards"],
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
                    description: "Dashboard metrics retrieved successfully",
                },
                "404": {
                    description: "Organization not found",
                },
            },
        },
    },
    "/dashboards/projects/{projectId}": {
        get: {
            summary: "Get project dashboard metrics",
            tags: ["Dashboards"],
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
                },
            ],
            responses: {
                "200": {
                    description: "Dashboard metrics retrieved successfully",
                },
                "404": {
                    description: "Project not found",
                },
            },
        },
    },
    "/dashboards/phases/{phaseId}": {
        get: {
            summary: "Get phase dashboard metrics",
            tags: ["Dashboards"],
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
                    description: "Dashboard metrics retrieved successfully",
                },
                "404": {
                    description: "Phase not found",
                },
            },
        },
    },
    "/dashboards/organizations/summary": {
        get: {
            summary: "Get organization dashboard AI summary",
            tags: ["Dashboards"],
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
                    description: "Dashboard AI summary retrieved successfully",
                },
                "404": {
                    description: "Organization not found",
                },
            },
        },
    },
    "/dashboards/projects/{projectId}/summary": {
        get: {
            summary: "Get project dashboard AI summary",
            tags: ["Dashboards"],
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
                },
            ],
            responses: {
                "200": {
                    description: "Dashboard AI summary retrieved successfully",
                },
                "404": {
                    description: "Project not found",
                },
            },
        },
    },
    "/dashboards/phases/{phaseId}/summary": {
        get: {
            summary: "Get phase dashboard AI summary",
            tags: ["Dashboards"],
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
                    description: "Dashboard AI summary retrieved successfully",
                },
                "404": {
                    description: "Phase not found",
                },
            },
        },
    },
};
