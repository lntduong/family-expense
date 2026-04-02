import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("secret123", 10);
  
  // Create users
  const wife = await prisma.user.upsert({
    where: { email: "wife@example.com" },
    update: {},
    create: { email: "wife@example.com", password, role: "WIFE" as any },
  });
  
  const husband = await prisma.user.upsert({
    where: { email: "husband@example.com" },
    update: {},
    create: { email: "husband@example.com", password, role: "HUSBAND" as any },
  });

  // Create default categories for wife
  const defaultCategories = [
    { name: "Ăn uống", icon: "🍔", color: "#ef4444" },
    { name: "Hóa đơn", icon: "💡", color: "#f59e0b" },
    { name: "Mua sắm", icon: "🛒", color: "#3b82f6" },
    { name: "Con cái", icon: "👶", color: "#ec4899" },
  ];

  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: { 
        name_userId: {
          name: cat.name,
          userId: wife.id,
        }
      },
      update: {},
      create: {
        ...cat,
        userId: wife.id,
      },
    });
  }

  // Create default categories for husband
  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: { 
        name_userId: {
          name: cat.name,
          userId: husband.id,
        }
      },
      update: {},
      create: {
        ...cat,
        userId: husband.id,
      },
    });
  }

  console.log("✅ Seed completed: Users and default categories created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
