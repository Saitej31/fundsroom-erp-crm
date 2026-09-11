import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function createAdmin() {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@fundsroom.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Admin created:", admin.email);
}

createAdmin()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });