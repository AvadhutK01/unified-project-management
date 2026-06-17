import postgres from "postgres";
import { env } from "../src/config/env.js";

const getTestUrlAndName = (url: string) => {
    try {
        const parsed = new URL(url);
        const dbName = parsed.pathname.replace(/^\//, "") || "postgres";
        const testDbName = `${dbName}_test`;
        parsed.pathname = `/${testDbName}`;

        const defaultParsed = new URL(url);
        defaultParsed.pathname = "/postgres";

        return {
            testDbUrl: parsed.toString(),
            testDbName,
            defaultDbUrl: defaultParsed.toString(),
        };
    } catch {
        return {
            testDbUrl: url,
            testDbName: "upm_test_db",
            defaultDbUrl: url,
        };
    }
};

export default async function globalSetup() {
    const { testDbUrl, testDbName, defaultDbUrl } = getTestUrlAndName(
        env.DATABASE_URL,
    );

    // Connect to 'postgres' default database to check/create the test db
    const sql = postgres(defaultDbUrl);

    try {
        console.log(`Checking if test database "${testDbName}" exists...`);
        const exists = await sql`
            SELECT 1 FROM pg_database WHERE datname = ${testDbName}
        `;
        if (exists.length === 0) {
            console.log(`Creating test database "${testDbName}"...`);
            await sql`CREATE DATABASE ${sql(testDbName)}`;
            console.log(`Test database "${testDbName}" created successfully.`);
        } else {
            console.log(`Test database "${testDbName}" already exists.`);
        }
    } catch (error) {
        console.error("Failed to create test database:", error);
    } finally {
        await sql.end();
    }

    // Now run migrations on the test database
    const { migrate } = await import("drizzle-orm/postgres-js/migrator");
    const { db } = await import("../src/infrastructure/database/client.js");
    const { sql: drizzleSql } = await import("drizzle-orm");

    console.log("Cleaning test database...");
    await db.execute(
        drizzleSql`DROP SCHEMA IF EXISTS public CASCADE; DROP SCHEMA IF EXISTS drizzle CASCADE; CREATE SCHEMA public;`,
    );

    console.log("Running migrations on test database...");
    await migrate(db, {
        migrationsFolder: "./src/infrastructure/database/migrations",
    });
    console.log("Test database migrations applied successfully.");
}
