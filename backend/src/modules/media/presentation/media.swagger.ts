export const mediaSwagger = {
    "/media/download": {
        get: {
            tags: ["Media"],
            summary: "Download media attachment file",
            description:
                "Proxies an S3 file attachment with Content-Disposition: attachment to force direct file download.",
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "url",
                    in: "query",
                    required: true,
                    description: "The S3 URL or key of the target file",
                    schema: { type: "string" },
                },
                {
                    name: "name",
                    in: "query",
                    required: false,
                    description: "Optional custom output filename for download",
                    schema: { type: "string" },
                },
            ],
            responses: {
                "200": {
                    description: "File stream for download",
                    content: {
                        "application/octet-stream": {
                            schema: {
                                type: "string",
                                format: "binary",
                            },
                        },
                    },
                },
                "400": { description: "Invalid or missing file URL parameter" },
                "401": { description: "Unauthorized" },
                "404": { description: "File not found" },
            },
        },
    },
};
