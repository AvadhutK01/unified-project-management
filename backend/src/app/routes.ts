import { Router } from "express";
import { userRouter } from "../modules/users/presentation/user.routes.js";

/**
 * Registers application routers on the parent Router.
 * @param router Express router object.
 * @returns The configured Router.
 */
export const registerRoutes = (router: Router): Router => {
    router.use("/users", userRouter);
    return router;
};
