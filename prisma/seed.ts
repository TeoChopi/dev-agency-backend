import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const products = [
    {
      name: 'Wireless Headphones',
      price: 99.99,
      category: 'Electronics',
      image_url: 'https://example.com/images/headphones.jpg',
      description: 'High-quality wireless headphones with noise cancellation',
      in_stock: true,
    },
    {
      name: 'Gaming Mouse',
      price: 49.99,
      category: 'Electronics',
      image_url: 'https://example.com/images/mouse.jpg',
      description: 'Ergonomic gaming mouse with RGB lighting',
      in_stock: true,
    },
    {
      name: 'Coffee Mug',
      price: 12.99,
      category: 'Home & Kitchen',
      image_url: 'https://example.com/images/mug.jpg',
      description: 'Ceramic coffee mug with heat retention',
      in_stock: true,
    },
    {
      name: 'Running Shoes',
      price: 129.99,
      category: 'Sports',
      image_url: 'https://example.com/images/shoes.jpg',
      description: 'Lightweight running shoes with excellent grip',
      in_stock: false,
    },
    {
      name: 'Desk Lamp',
      price: 34.99,
      category: 'Home & Office',
      image_url: 'https://example.com/images/lamp.jpg',
      description: 'Adjustable LED desk lamp with USB charging port',
      in_stock: true,
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log('✅ Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });