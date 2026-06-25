import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email    = process.env.ADMIN_EMAIL    ?? "admin@axiom.careers";
  const password = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  const name     = process.env.ADMIN_NAME     ?? "AXIOM Admin";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Promote to ADMIN if already exists
    await prisma.user.update({ where: { email }, data: { role: "ADMIN" } });
    console.log(`Promoted ${email} to ADMIN`);
    return;
  }

  await prisma.user.create({
    data: {
      email,
      name,
      password: await bcrypt.hash(password, 12),
      role: "ADMIN",
      emailVerified: true,
    },
  });
  console.log(`Admin user created: ${email}`);
}

main().finally(() => prisma.$disconnect());
