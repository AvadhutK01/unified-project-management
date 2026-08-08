import { Router } from "express";
import { userRouter } from "../modules/users/presentation/user.routes.js";
import { organizationRouter } from "../modules/organizations/presentation/organization.routes.js";
import { roleRouter } from "../modules/roles/presentation/role.routes.js";
import { projectRouter } from "../modules/projects/presentation/project.routes.js";
import { phaseRouter } from "../modules/phases/presentation/phase.routes.js";
import { sprintRouter } from "../modules/sprints/presentation/sprint.routes.js";
import { workitemRoutes } from "../modules/workitems/presentation/workitem.routes.js";
import { reportRouter } from "../modules/reports/presentation/report.routes.js";
import { dashboardRouter } from "../modules/dashboards/presentation/dashboard.routes.js";
import { notificationRouter } from "../modules/notifications/presentation/notification.routes.js";
import { subscriptionRouter } from "../modules/subscriptions/presentation/subscription.routes.js";
import { chatRouter } from "../modules/chat/presentation/chat.routes.js";

/**
 * Registers application routers on the parent Router.
 * @param router Express router object.
 * @returns The configured Router.
 */
export const registerRoutes = (router: Router): Router => {
    router.use("/users", userRouter);
    router.use("/organizations", organizationRouter);
    router.use("/members/chat", chatRouter);
    router.use("/roles", roleRouter);
    router.use("/projects", projectRouter);
    router.use("/phases", phaseRouter);
    router.use("/sprints", sprintRouter);
    router.use("/workitems", workitemRoutes);
    router.use("/reports", reportRouter);
    router.use("/dashboards", dashboardRouter);
    router.use("/notifications", notificationRouter);
    router.use("/subscriptions", subscriptionRouter);
    return router;
};
