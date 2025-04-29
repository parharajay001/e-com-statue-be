import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      email: 'admin@gmail.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create categories
  const categories = [
    {
      name: 'Greek Mythology',
      description: 'Statues depicting figures from Greek mythology',
    },
    {
      name: 'Roman Empire',
      description: 'Statues from the Roman period',
    },
    {
      name: 'Modern Art',
      description: 'Contemporary statue designs',
    },
    {
      name: 'Asian Culture',
      description: 'Statues representing Asian cultural heritage',
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
