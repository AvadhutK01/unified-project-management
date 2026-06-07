import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: [
        "./src/infrastructure/database/schema/user.ts",
        "./src/infrastructure/database/schema/organization.ts",
    ],
    out: "./src/infrastructure/database/migrations",
    dialect: "postgresql",
    dbCredentials: {
        url:
            process.env.DATABASE_URL ||
            "postgres://postgres:postgres@localhost:5432/postgres",
    },
    verbose: true,
    strict: true,
});
