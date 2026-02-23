import { PrismaClient } from '@prisma/client';
import { logger } from '../src/utils/logger';

const prisma = new PrismaClient();

async function main() {
  logger.info('Starting database seed...');

  // Seed products
  const products = [
    {
      name: 'MacBook Pro 16"',
      price: 2499.99,
      category: 'Electronics',
      image_url: 'https://example.com/images/macbook-pro.jpg',
      description: 'Powerful laptop for professionals',
      stock: 50,
    },
    {
      name: 'iPhone 15 Pro',
      price: 999.99,
      category: 'Electronics',
      image_url: 'https://example.com/images/iphone-15-pro.jpg',
      description: 'Latest iPhone with advanced features',
      stock: 100,
    },
    {
      name: 'Nike Air Max 270',
      price: 149.99,
      category: 'Clothing',
      image_url: 'https://example.com/images/nike-air-max.jpg',
      description: 'Comfortable running shoes',
      stock: 75,
    },
    {
      name: 'Sony WH-1000XM4',
      price: 299.99,
      category: 'Electronics',
      image_url: 'https://example.com/images/sony-headphones.jpg',
      description: 'Noise-canceling headphones',
      stock: 30,
    },
    {
      name: 'The Great Gatsby',
      price: 12.99,
      category: 'Books',
      image_url: 'https://example.com/images/great-gatsby.jpg',
      description: 'Classic American novel',
      stock: 200,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { name: product.name },
      update: {},
      create: product,
    });
  }

  logger.info(`Seeded ${products.length} products`);
  logger.info('Database seed completed successfully!');
}

main()
  .catch((e) => {
    logger.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });