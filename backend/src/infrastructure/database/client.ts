import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../../config/env.js";
import * as schema from "./schema/index.js";
import { ExtractTablesWithRelations } from "drizzle-orm";
import { PgTransaction } from "drizzle-orm/pg-core";
import { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";

/**
 * Utility function to derive a test database URL by appending '_test' to the target database name.
 * @param url Primary database connection string.
 * @returns Test database connection string.
 */
const getTestDatabaseUrl = (url: string) => {
    try {
        const parsed = new URL(url);
        const dbName = parsed.pathname.replace(/^\//, "") || "postgres";
        parsed.pathname = `/${dbName}_test`;
        return parsed.toString();
    } catch {
        return url;
    }
};

const dbUrl =
    process.env.NODE_ENV === "test"
        ? env.DATABASE_TEST_URL || getTestDatabaseUrl(env.DATABASE_URL)
        : env.DATABASE_URL;

const queryClient = postgres(dbUrl);
export const db = drizzle(queryClient, { schema });

export type {
    Database,
    Transaction,
    DatabaseOrTransaction,
} from "../../types/database.js";
