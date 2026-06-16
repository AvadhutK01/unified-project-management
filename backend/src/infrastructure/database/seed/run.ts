import { seedPermissions } from "./permissions.seed.js";

/**
 * Main function to run all database seeders.
 */
async function run() {
    console.log("Start seeding...");
    await seedPermissions();
    console.log("Seeding finished successfully.");
    process.exit(0);
}

run().catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
});
