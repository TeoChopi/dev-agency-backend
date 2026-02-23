import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('Start seeding...');

  const products = [
    {
      name: 'Wireless Bluetooth Headphones',
      price: 79.99,
      category: 'Electronics',
      image_url: 'https://example.com/images/headphones.jpg',
    },
    {
      name: 'Organic Cotton T-Shirt',
      price: 24.99,
      category: 'Clothing',
      image_url: 'https://example.com/images/tshirt.jpg',
    },
    {
      name: 'Stainless Steel Water Bottle',
      price: 19.99,
      category: 'Home & Garden',
      image_url: 'https://example.com/images/bottle.jpg',
    },
    {
      name: 'Yoga Mat Premium',
      price: 45.00,
      category: 'Sports & Fitness',
      image_url: 'https://example.com/images/yoga-mat.jpg',
    },
    {
      name: 'Coffee Maker Deluxe',
      price: 129.99,
      category: 'Appliances',
      image_url: 'https://example.com/images/coffee-maker.jpg',
    },
  ];

  for (const product of products) {
    const result = await prisma.product.create({
      data: product,
    });
    console.log(`Created product with id: ${result.id}`);
  }

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });