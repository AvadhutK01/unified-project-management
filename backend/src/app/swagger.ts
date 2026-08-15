import { Express } from "express";
import swaggerUi from "swagger-ui-express";
import { userSwaggerPaths } from "../modules/users/presentation/user.swagger.js";
import { organizationSwaggerPaths } from "../modules/organizations/presentation/organization.swagger.js";
import { chatSwaggerPaths } from "../modules/chat/presentation/chat.swagger.js";
import { roleSwaggerPaths } from "../modules/roles/presentation/role.swagger.js";
import { projectSwaggerPaths } from "../modules/projects/presentation/project.swagger.js";
import { phaseSwaggerPaths } from "../modules/phases/presentation/phase.swagger.js";
import { sprintSwaggerPaths } from "../modules/sprints/presentation/sprint.swagger.js";
import { workitemSwaggerPaths } from "../modules/workitems/presentation/workitem.swagger.js";
import { reportSwaggerPaths } from "../modules/reports/presentation/report.swagger.js";
import { dashboardSwaggerPaths } from "../modules/dashboards/presentation/dashboard.swagger.js";
import { notificationSwaggerPaths } from "../modules/notifications/presentation/notification.swagger.js";
import { subscriptionSwaggerPaths } from "../modules/subscriptions/presentation/subscription.swagger.js";

const swaggerDocument = {
    openapi: "3.0.0",
    info: {
        title: "Project Management API",
        version: "1.0.0",
        description:
            "API documentation for user authentication, OTP verification, organization management, roles, and permissions.",
    },
    servers: [
        {
            url: "/api",
            description: "Local server",
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            },
        },
    },
    paths: {
        ...userSwaggerPaths,
        ...organizationSwaggerPaths,
        ...chatSwaggerPaths,
        ...roleSwaggerPaths,
        ...projectSwaggerPaths,
        ...phaseSwaggerPaths,
        ...sprintSwaggerPaths,
        ...workitemSwaggerPaths,
        ...reportSwaggerPaths,
        ...dashboardSwaggerPaths,
        ...notificationSwaggerPaths,
        ...subscriptionSwaggerPaths,
    },
};

/**
 * Mounts Swagger UI middleware on the Express application at /api-docs.
 * @param app Express application instance.
 */
export const serveSwagger = (app: Express): void => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
