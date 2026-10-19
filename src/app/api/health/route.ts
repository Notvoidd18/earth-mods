import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const uptime = process.uptime();
  const timestamp = new Date().toISOString();

  let dbStatus: "connected" | "unconfigured" | "error" = "unconfigured";

  if (pool) {
    try {
      // Fast lightweight query to verify connectivity without leaking data
      const client = await pool.connect();
      try {
        await client.query("SELECT 1");
        dbStatus = "connected";
      } finally {
        client.release();
      }
    } catch {
      dbStatus = "error";
    }
  }

  const isHealthy = dbStatus === "connected" || dbStatus === "unconfigured";

  return NextResponse.json(
    {
      status: isHealthy ? "healthy" : "degraded",
      system: "EARTH_MODS_PLANETARY_REGISTRY",
      version: "2026.10.1",
      uptimeSeconds: Math.floor(uptime),
      timestamp,
      database: dbStatus,
    },
    {
      status: isHealthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
