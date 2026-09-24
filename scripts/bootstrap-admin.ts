/**
 * Admin bootstrap script — creates the first superadmin user.
 *
 * Run with: bun run scripts/bootstrap-admin.ts
 *
 * Prompts for email, name, and password interactively.
 * Password is hashed with bcrypt before storage — never logged or stored in plaintext.
 *
 * After bootstrap, the setup mechanism cannot be used by unauthorized users —
 * they must have database access to create admin users.
 */

import bcrypt from "bcryptjs";
import { db } from "../src/lib/db";

async function bootstrap() {
  console.log("🔧 Allison Global — Admin Bootstrap\n");
  console.log("This will create a superadmin user.\n");

  const email = await prompt("Admin email: ");
  const name = await prompt("Admin name: ");
  const password = await promptPassword("Password (min 12 chars): ");

  if (!email || !email.includes("@")) {
    console.error("❌ Valid email required.");
    process.exit(1);
  }
  if (!name || name.length < 2) {
    console.error("❌ Name must be at least 2 characters.");
    process.exit(1);
  }
  if (!password || password.length < 12) {
    console.error("❌ Password must be at least 12 characters.");
    process.exit(1);
  }

  const existing = await db.adminUser.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    console.error(`❌ A user with email "${email}" already exists.`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await db.adminUser.create({
    data: { email: email.toLowerCase(), name, passwordHash, role: "superadmin" },
    select: { id: true, email: true, name: true, role: true },
  });

  console.log(`\n✅ Superadmin created successfully!`);
  console.log(`   ID:    ${user.id}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Name:  ${user.name}`);
  console.log(`   Role:  ${user.role}`);
  console.log(`\n   You can now log in at /admin/login`);

  await db.$disconnect();
}

function prompt(question: string): Promise<string> {
  process.stdout.write(question);
  return new Promise((resolve) => {
    process.stdin.resume();
    process.stdin.setEncoding("utf-8");
    process.stdin.once("data", (data) => {
      process.stdin.pause();
      resolve(data.toString().trim());
    });
  });
}

function promptPassword(question: string): Promise<string> {
  process.stdout.write(question);
  return new Promise((resolve) => {
    process.stdin.resume();
    process.stdin.setEncoding("utf-8");
    process.stdin.once("data", (data) => {
      process.stdin.pause();
      resolve(data.toString().trim());
    });
  });
}

bootstrap().catch((err) => {
  console.error("❌ Bootstrap failed:", err);
  process.exit(1);
});
