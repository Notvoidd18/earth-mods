import { pool, db } from "./index";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "path";

async function runMigrations() {
  if (!db) {
    console.error("❌ Cannot migrate database: DATABASE_URL is not set.");
    process.exit(1);
  }

  console.log("🏛️ Executing Earth Mods database schema migrations against PostgreSQL...");

  try {
    const migrationsFolder = path.resolve(process.cwd(), "./src/lib/db/migrations");
    await migrate(db, { migrationsFolder });
    console.log("✅ All migrations applied successfully.");
  } catch (error) {
    console.error("❌ Migration error occurred:", error);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

runMigrations()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
