import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

function generateInviteCode() {
  return randomBytes(4).toString('hex').toUpperCase(); // Creates an 8 character uppercase hex string e.g., '1A2B3C4D'
}

async function main() {
  console.log('Starting workspace migration...');

  const users = await prisma.user.findMany();
  console.log(`Found ${users.length} users.`);

  for (const user of users) {
    let wsName = 'Cá nhân';
    if (user.id === 'cmnhiqczu0000afp1mk3hpxqy') {
      wsName = 'Chi tiêu gia đình';
    }

    // Check if user already owns any workspace
    const existing = await prisma.workspace.findFirst({
      where: { ownerId: user.id },
    });

    if (existing) {
      console.log(`User ${user.email} already has workspace: ${existing.name}. Skipping workspace creation.`);
      
      // Still migrate unmapped data if any
      const expUpdated = await prisma.expense.updateMany({
        where: { userId: user.id, workspaceId: null },
        data: { workspaceId: existing.id },
      });
      const catUpdated = await prisma.category.updateMany({
        where: { userId: user.id, workspaceId: null },
        data: { workspaceId: existing.id },
      });
      const budUpdated = await prisma.budget.updateMany({
        where: { userId: user.id, workspaceId: null },
        data: { workspaceId: existing.id },
      });
      
      console.log(`Migrated ${expUpdated.count} expenses, ${catUpdated.count} categories, ${budUpdated.count} budgets for ${user.email} into ${existing.name}.`);
      continue;
    }

    // 1. Create Workspace
    const workspace = await prisma.workspace.create({
      data: {
        name: wsName,
        inviteCode: generateInviteCode(),
        ownerId: user.id,
        members: {
          connect: { id: user.id }
        }
      }
    });
    console.log(`Created Workspace "${wsName}" for user ${user.email}`);

    // 2. Map existing Expenses
    const mappedExpenses = await prisma.expense.updateMany({
      where: { userId: user.id },
      data: { workspaceId: workspace.id }
    });

    // 3. Map existing Categories
    const mappedCategories = await prisma.category.updateMany({
      where: { userId: user.id },
      data: { workspaceId: workspace.id }
    });

    // 4. Map existing Budgets
    const mappedBudgets = await prisma.budget.updateMany({
      where: { userId: user.id },
      data: { workspaceId: workspace.id }
    });

    console.log(`  -> Migrated ${mappedExpenses.count} expenses, ${mappedCategories.count} categories, ${mappedBudgets.count} budgets.`);
  }

  console.log('Migration completed successfully.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
