import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, PoolConfig } from "pg";
import * as schema from "./schema";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

function createPool(): Pool | null {
  if (!connectionString) {
    console.warn("⚠️ DATABASE_URL is not defined. Database operations will be unavailable.");
    return null;
  }

  const isAivenOrCloud =
    connectionString.includes("aivencloud.com") ||
    connectionString.includes("sslmode=require") ||
    process.env.NODE_ENV === "production";

  const poolConfig: PoolConfig = {
    connectionString,
    max: process.env.NODE_ENV === "production" ? 15 : 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };

  if (isAivenOrCloud) {
    poolConfig.ssl = {
      rejectUnauthorized: false, // Allows Aiven's managed TLS connection securely
    };
  }

  const pool = new Pool(poolConfig);

  pool.on("error", (err) => {
    console.error("Unexpected error on idle PostgreSQL client:", err);
  });

  return pool;
}

export const pool = createPool();
export const db = pool ? drizzle(pool, { schema }) : null;
