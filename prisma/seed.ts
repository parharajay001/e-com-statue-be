import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: faker.person.fullName(),
      role: Role.ADMIN,
    },
  });

  // Create categories
  const categoryNames = ['Greek Mythology', 'Roman Mythology', 'Modern Art', 'Contemporary', 'Abstract', 'Classical'];
  const categories = await Promise.all(
    categoryNames.map((name) =>
      prisma.category.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );

  // Create sample products
  const products = [];
  for (let i = 0; i < 20; i++) {
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const productName = `${faker.word.adjective()} ${faker.word.noun()} Statue`;
    
    const product = await prisma.product.create({
      data: {
        name: productName,
        description: faker.commerce.productDescription(),
        price: parseFloat(faker.commerce.price({ min: 99, max: 999 })),
        stock: faker.number.int({ min: 1, max: 50 }),
        images: JSON.stringify([
          faker.image.url(),
          faker.image.url(),
          faker.image.url()
        ]),
        categoryId: randomCategory.id,
      },
    });
    products.push(product);
  }

  // Create some regular users
  const users = [];
  for (let i = 0; i < 5; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        password: await bcrypt.hash('password123', 10),
        name: faker.person.fullName(),
        role: Role.USER,
      },
    });
    users.push(user);
  }

  console.log('Database seeded successfully');
  console.log('Admin user created:', admin);
  console.log('Categories created:', categories.length);
  console.log('Products created:', products.length);
  console.log('Regular users created:', users.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });