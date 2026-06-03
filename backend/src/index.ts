import { startServer } from "./app/server.js";
import { logger } from "./config/logger.js";

try {
    startServer();
} catch (error) {
    logger.fatal({ error }, "Application failed to start");
    process.exit(1);
}
