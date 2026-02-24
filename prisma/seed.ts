import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const products = [
    {
      name: 'Laptop Pro',
      price: 1299.99,
      category: 'Electronics',
      image_url: 'https://example.com/laptop.jpg',
    },
    {
      name: 'Coffee Mug',
      price: 12.99,
      category: 'Home & Kitchen',
      image_url: 'https://example.com/mug.jpg',
    },
    {
      name: 'Running Shoes',
      price: 89.99,
      category: 'Sports',
      image_url: 'https://example.com/shoes.jpg',
    },
    {
      name: 'Wireless Headphones',
      price: 199.99,
      category: 'Electronics',
      image_url: 'https://example.com/headphones.jpg',
    },
    {
      name: 'Desk Lamp',
      price: 45.99,
      category: 'Home & Kitchen',
      image_url: 'https://example.com/lamp.jpg',
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });