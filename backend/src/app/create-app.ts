import express, { Express } from "express";
import cors from "cors";
import { registerRoutes } from "./routes.js";
import { errorHandler } from "../shared/middleware/error-handler.js";
import { notFound } from "../shared/middleware/not-found.js";

export const createApp = (): Express => {
    const app = express();

    app.use(cors());
    app.use(express.json());

    app.get("/health", (_req, res) => {
        res.status(200).json({ status: "ok" });
    });

    const apiRouter = express.Router();
    app.use("/api", registerRoutes(apiRouter));

    app.use(notFound);
    app.use(errorHandler);

    return app;
};
