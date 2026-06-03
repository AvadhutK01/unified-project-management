import pino, { LoggerOptions } from "pino";
import { env } from "./env.js";

const pinoOptions: LoggerOptions = {
    level: env.NODE_ENV === "production" ? "info" : "debug",
};

if (env.NODE_ENV !== "production") {
    pinoOptions.transport = {
        target: "pino-pretty",
        options: {
            colorize: true,
            translateTime: "HH:MM:ss Z",
            ignore: "pid,hostname",
        },
    };
}

export const logger = pino(pinoOptions);
