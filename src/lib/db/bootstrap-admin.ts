import { pool, db } from "./index";
import { moderators } from "./schema";
import { hashPassword } from "../security/auth";
import { eq } from "drizzle-orm";

/**
 * CLI utility to safely provision or reset the initial Earth Mods administrator.
 * Usage:
 *   npx tsx src/lib/db/bootstrap-admin.ts <username> <email> <password>
 * Or rely on environment variables: INITIAL_ADMIN_USERNAME, INITIAL_ADMIN_EMAIL, INITIAL_ADMIN_PASSWORD
 */
async function bootstrapAdmin() {
  if (!db) {
    console.error("❌ Cannot bootstrap admin: DATABASE_URL is not set.");
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const username = args[0] || process.env.INITIAL_ADMIN_USERNAME || "archon_prime";
  const email = args[1] || process.env.INITIAL_ADMIN_EMAIL || "directorate@earthmods.internal";
  const password = args[2] || process.env.INITIAL_ADMIN_PASSWORD;

  if (!password) {
    console.error(
      "❌ Error: Admin password must be supplied via CLI argument or INITIAL_ADMIN_PASSWORD env var."
    );
    console.error("Usage: npm run db:bootstrap-admin <username> <email> <password>");
    process.exit(1);
  }

  if (password.length < 12) {
    console.error("❌ Error: Institutional admin passwords must be at least 12 characters.");
    process.exit(1);
  }

  console.log(`🏛️ Bootstrapping institutional administrator account: ${username} (${email})...`);

  try {
    const hashedPassword = await hashPassword(password);

    const existing = await db
      .select({ id: moderators.id })
      .from(moderators)
      .where(eq(moderators.username, username))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(moderators)
        .set({
          email,
          passwordHash: hashedPassword,
          role: "ADMIN",
          isActive: true,
        })
        .where(eq(moderators.id, existing[0].id));
      console.log(`✅ Existing administrator [${username}] updated successfully.`);
    } else {
      await db.insert(moderators).values({
        username,
        email,
        passwordHash: hashedPassword,
        role: "ADMIN",
        isActive: true,
      });
      console.log(`✅ Administrator [${username}] created successfully.`);
    }
  } catch (err) {
    console.error("❌ Admin bootstrap failed:", err);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

bootstrapAdmin()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
