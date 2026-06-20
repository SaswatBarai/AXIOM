import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Seed admin user
  const hashedPassword = await bcrypt.hash("Admin@123", 10);

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
  const demoPassword = await bcrypt.hash("Demo@123", 10);

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
