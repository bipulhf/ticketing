import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  // Check if system owner already exists
  const existingSystemOwner = await prisma.user.findFirst({
    where: { role: "system_owner" },
  });

  if (existingSystemOwner) {
    console.log("System owner already exists. Skipping seed.");
    return;
  }

  // Create system owner account
  const hashedPassword = await bcrypt.hash("defaultPassword123!", 12);

  const systemOwner = await prisma.user.create({
    data: {
      username: "system_owner",
      email: "admin@helpdesk.com",
      password: hashedPassword,
      role: "system_owner",
      isActive: true,
    },
  });

  console.log("✅ System owner created:", {
    id: systemOwner.id,
    username: systemOwner.username,
    email: systemOwner.email,
    role: systemOwner.role,
  });

  console.log("🔑 Default credentials:");
  console.log("   Username: system_owner");
  console.log("   Password: defaultPassword123!");
  console.log("⚠️  Please change the default password after first login!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
