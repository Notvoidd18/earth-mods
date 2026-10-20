import { pool, db } from "./index";
import { moderators, sessions } from "./schema";
import { hashPassword } from "../security/auth";
import { eq, ilike } from "drizzle-orm";
import readline from "readline";

/**
 * Reads a password securely from standard input with masking (asterisks).
 * Prevents password exposure in terminal history, process lists, or shoulder-surfing.
 */
async function readInteractivePassword(promptText: string): Promise<string> {
  if (!process.stdin.isTTY) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
      rl.question(promptText, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    });
  }

  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    process.stdout.write(promptText);
    let pwd = "";

    const wasRaw = process.stdin.isRaw;
    process.stdin.setRawMode(true);
    process.stdin.resume();

    const onData = (chunk: Buffer) => {
      const code = chunk.toString();
      for (const char of code) {
        if (char === "\r" || char === "\n") {
          process.stdin.setRawMode(wasRaw ?? false);
          process.stdin.removeListener("data", onData);
          process.stdout.write("\n");
          rl.close();
          resolve(pwd);
          return;
        } else if (char === "\u0003") {
          // SIGINT / Ctrl+C
          process.stdout.write("\nOperation aborted by operator.\n");
          process.exit(1);
        } else if (char === "\b" || char === "\x7f") {
          // Backspace
          if (pwd.length > 0) {
            pwd = pwd.slice(0, -1);
            process.stdout.write("\b \b");
          }
        } else if (char.charCodeAt(0) >= 32) {
          pwd += char;
          process.stdout.write("*");
        }
      }
    };

    process.stdin.on("data", onData);
  });
}

/**
 * Validates password strength according to institutional policies.
 */
export function validatePasswordStrength(password: string): { valid: boolean; reason?: string } {
  if (!password || typeof password !== "string") {
    return { valid: false, reason: "Password is required." };
  }
  const trimmed = password.trim();
  if (trimmed.length < 12) {
    return { valid: false, reason: "Institutional admin passwords must be at least 12 characters long." };
  }
  if (trimmed.length > 128) {
    return { valid: false, reason: "Password exceeds maximum allowable length (128 characters)." };
  }
  if (/^[0-9]+$/.test(trimmed) || /^[a-zA-Z]+$/.test(trimmed)) {
    return { valid: false, reason: "Password must contain a mixture of characters, not solely numbers or letters." };
  }
  return { valid: true };
}

/**
 * CLI utility to safely provision or reset the initial Earth Mods administrator.
 *
 * Security Guarantees:
 * 1. Never creates duplicate moderator accounts.
 * 2. Enforces ADMIN role retention.
 * 3. Invalidates all existing active sessions for the user upon reset.
 * 4. Never prints passwords, hashes, or database connection strings.
 * 5. Supports interactive masked input to avoid shell history persistence.
 */
export async function bootstrapAdmin() {
  if (!db) {
    console.error("❌ Cannot bootstrap administrator: DATABASE_URL is not configured.");
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const username = args[0] || process.env.INITIAL_ADMIN_USERNAME || "archon_prime";
  const email = args[1] || process.env.INITIAL_ADMIN_EMAIL || "directorate@earthmods.internal";

  let password = args[2] || process.env.INITIAL_ADMIN_PASSWORD;

  if (args[2]) {
    console.warn(
      "⚠️ Security Notice: Passing passwords as CLI arguments may expose them in shell history (history/ps).\n" +
      "   Prefer interactive prompting or setting the INITIAL_ADMIN_PASSWORD environment variable."
    );
  }

  if (!password) {
    password = await readInteractivePassword(`Enter administrator password for [${username}] (masked): `);
  }

  const strengthCheck = validatePasswordStrength(password);
  if (!strengthCheck.valid) {
    console.error(`❌ Policy Violation: ${strengthCheck.reason}`);
    process.exit(1);
  }

  console.log(`🏛️ Provisioning institutional administrator account: ${username} (${email})...`);

  try {
    const hashedPassword = await hashPassword(password);

    await db.transaction(async (tx) => {
      const existing = await tx
        .select({ id: moderators.id, role: moderators.role })
        .from(moderators)
        .where(ilike(moderators.username, username.trim()))
        .limit(1);

      if (existing.length > 0) {
        const moderatorId = existing[0].id;

        // 1. Update existing admin
        await tx
          .update(moderators)
          .set({
            email: email.trim(),
            passwordHash: hashedPassword,
            role: "ADMIN", // Guarantee role is always ADMIN
            isActive: true,
          })
          .where(eq(moderators.id, moderatorId));

        // 2. Invalidate all active sessions for this administrator to prevent session hijacking
        await tx
          .delete(sessions)
          .where(eq(sessions.moderatorId, moderatorId));

        console.log(`✅ Administrator [${username}] updated successfully.`);
        console.log(`🔒 All prior active sessions for [${username}] have been revoked.`);
      } else {
        // Create new admin
        await tx.insert(moderators).values({
          username: username.trim(),
          email: email.trim(),
          passwordHash: hashedPassword,
          role: "ADMIN",
          isActive: true,
        });

        console.log(`✅ Administrator [${username}] created successfully with ADMIN role.`);
      }
    });
  } catch (err: any) {
    console.error("❌ Administrator provisioning failed:", err.message || err);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Execute if run directly from CLI
if (require.main === module || (typeof process !== "undefined" && process.argv[1]?.endsWith("bootstrap-admin.ts"))) {
  bootstrapAdmin()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
