export const reportSwaggerPaths = {
    "/reports/project-overview": {
        get: {
            summary: "Get project overview report",
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
                    name: "startDate",
                    in: "query",
                    required: true,
                    schema: {
                        type: "string",
                        format: "date-time",
                    },
                    description: "Start date (ISO datetime)",
                },
                {
                    name: "endDate",
                    in: "query",
                    required: true,
                    schema: {
                        type: "string",
                        format: "date-time",
                    },
                    description: "End date (ISO datetime)",
                },
            ],
            responses: {
                "200": {
                    description: "Project overview report",
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
                "403": {
                    description: "Forbidden",
                },
            },
        },
    },
    "/reports/sprint-performance": {
        get: {
            summary: "Get sprint performance report",
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
                    name: "startDate",
                    in: "query",
                    required: true,
                    schema: {
                        type: "string",
                        format: "date-time",
                    },
                },
                {
                    name: "endDate",
                    in: "query",
                    required: true,
                    schema: {
                        type: "string",
                        format: "date-time",
                    },
                },
            ],
            responses: {
                "200": {
                    description: "Sprint performance report",
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
            },
        },
    },
    "/reports/member-activity": {
        get: {
            summary: "Get member activity report",
            tags: ["Reports"],
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
                    name: "startDate",
                    in: "query",
                    required: true,
                    schema: {
                        type: "string",
                        format: "date",
                    },
                },
                {
                    name: "endDate",
                    in: "query",
                    required: true,
                    schema: {
                        type: "string",
                        format: "date",
                    },
                },
                {
                    name: "memberId",
                    in: "query",
                    required: false,
                    schema: {
                        type: "string",
                        format: "uuid",
                    },
                    description: "Optional member ID to filter by",
                },
            ],
            responses: {
                "200": {
                    description: "Member activity report",
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
                                                        memberName: {
                                                            type: "string",
                                                        },
                                                        projectName: {
                                                            type: "string",
                                                        },
                                                        phaseName: {
                                                            type: "string",
                                                        },
                                                        sprintName: {
                                                            type: "string",
                                                        },
                                                        totalWorkitems: {
                                                            type: "number",
                                                        },
                                                        statusCounts: {
                                                            type: "object",
                                                            properties: {
                                                                new: {
                                                                    type: "number",
                                                                },
                                                                active: {
                                                                    type: "number",
                                                                },
                                                                resolved: {
                                                                    type: "number",
                                                                },
                                                                closed: {
                                                                    type: "number",
                                                                },
                                                                removed: {
                                                                    type: "number",
                                                                },
                                                                onhold: {
                                                                    type: "number",
                                                                },
                                                            },
                                                        },
                                                        totalWorkedTime: {
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
            },
        },
    },
    "/reports/phase-overview": {
        get: {
            summary: "Get phase overview report",
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
                    name: "startDate",
                    in: "query",
                    required: true,
                    schema: {
                        type: "string",
                        format: "date-time",
                    },
                },
                {
                    name: "endDate",
                    in: "query",
                    required: true,
                    schema: {
                        type: "string",
                        format: "date-time",
                    },
                },
            ],
            responses: {
                "200": {
                    description: "Phase overview report",
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
                "403": {
                    description: "Forbidden",
                },
            },
        },
    },
};
