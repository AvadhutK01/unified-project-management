import express, { Express } from "express";
import cors from "cors";
import { registerRoutes } from "./routes.js";
import { serveSwagger } from "./swagger.js";
import { errorHandler } from "../shared/middleware/error-handler.js";
import { notFound } from "../shared/middleware/not-found.js";
import { requestLogger } from "../shared/middleware/request-logger.js";

/**
 * Factory function to instantiate, configure, and return the Express application.
 * @returns The fully configured Express application object.
 */
export const createApp = (): Express => {
    const app = express();

    app.set("trust proxy", 1);

    app.use(requestLogger);

    app.use(
        cors({
            origin: "*",
            credentials: true,
        }),
    );
    app.use(express.json());

    app.get("/health", (_req, res) => {
        res.status(200).json({ status: "ok" });
    });

    const apiRouter = express.Router();
    app.use("/api", registerRoutes(apiRouter));

    serveSwagger(app);

    app.use(notFound);
    app.use(errorHandler);

    return app;
};
