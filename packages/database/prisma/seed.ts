import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;
  if (!adminPassword) {
    throw new Error("ADMIN_SEED_PASSWORD env var is required for seeding");
  }
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@axiom.dev" },
    update: {},
    create: {
      email: "admin@axiom.dev",
      name: "AXIOM Admin",
      password: hashedPassword,
      role: "ADMIN",
      emailVerified: true,
      preferences: {
        create: {
          theme: "dark",
          emailNotifications: true,
          jobAlerts: true,
          weeklyDigest: true,
        },
      },
    },
  });

  // Seed demo user
  const demoPasswordVal = process.env.DEMO_SEED_PASSWORD;
  if (!demoPasswordVal) {
    throw new Error("DEMO_SEED_PASSWORD env var is required for seeding");
  }
  const demoPassword = await bcrypt.hash(demoPasswordVal, 10);

  const demo = await prisma.user.upsert({
    where: { email: "demo@axiom.dev" },
    update: {},
    create: {
      email: "demo@axiom.dev",
      name: "Demo User",
      password: demoPassword,
      role: "USER",
      emailVerified: true,
      currentTitle: "Software Engineer",
      yearsOfExp: 2,
      preferences: {
        create: {
          theme: "dark",
        },
      },
    },
  });

  console.warn(`Seeded: admin(${admin.id}), demo(${demo.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
