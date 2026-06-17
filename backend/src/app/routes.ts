import { Router } from "express";
import { userRouter } from "../modules/users/presentation/user.routes.js";
import { organizationRouter } from "../modules/organizations/presentation/organization.routes.js";
import { roleRouter } from "../modules/roles/presentation/role.routes.js";
import { projectRouter } from "../modules/projects/presentation/project.routes.js";

/**
 * Registers application routers on the parent Router.
 * @param router Express router object.
 * @returns The configured Router.
 */
export const registerRoutes = (router: Router): Router => {
    router.use("/users", userRouter);
    router.use("/organizations", organizationRouter);
    router.use("/roles", roleRouter);
    router.use("/projects", projectRouter);
    return router;
};
