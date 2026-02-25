import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleProducts = [
  {
    name: 'MacBook Pro 14-inch',
    price: 1999.99,
    category: 'Electronics',
    imageUrl: 'https://example.com/images/macbook-pro-14.jpg',
  },
  {
    name: 'iPhone 15 Pro',
    price: 999.99,
    category: 'Electronics',
    imageUrl: 'https://example.com/images/iphone-15-pro.jpg',
  },
  {
    name: 'Nike Air Max 270',
    price: 150.00,
    category: 'Footwear',
    imageUrl: 'https://example.com/images/nike-air-max-270.jpg',
  },
  {
    name: 'Samsung 65" 4K Smart TV',
    price: 799.99,
    category: 'Electronics',
    imageUrl: 'https://example.com/images/samsung-65-4k-tv.jpg',
  },
  {
    name: 'Adidas Ultraboost 22',
    price: 180.00,
    category: 'Footwear',
    imageUrl: 'https://example.com/images/adidas-ultraboost-22.jpg',
  },
  {
    name: 'Sony WH-1000XM4 Headphones',
    price: 349.99,
    category: 'Electronics',
    imageUrl: 'https://example.com/images/sony-wh-1000xm4.jpg',
  },
  {
    name: 'Levi\'s 501 Original Jeans',
    price: 89.99,
    category: 'Clothing',
    imageUrl: 'https://example.com/images/levis-501-jeans.jpg',
  },
  {
    name: 'Canon EOS R5 Camera',
    price: 3899.99,
    category: 'Electronics',
    imageUrl: 'https://example.com/images/canon-eos-r5.jpg',
  },
  {
    name: 'The North Face Jacket',
    price: 249.99,
    category: 'Clothing',
    imageUrl: 'https://example.com/images/north-face-jacket.jpg',
  },
  {
    name: 'Dyson V15 Detect Vacuum',
    price: 749.99,
    category: 'Home & Garden',
    imageUrl: 'https://example.com/images/dyson-v15-detect.jpg',
  },
  {
    name: 'KitchenAid Stand Mixer',
    price: 399.99,
    category: 'Home & Garden',
    imageUrl: 'https://example.com/images/kitchenaid-mixer.jpg',
  },
  {
    name: 'Patagonia Fleece Pullover',
    price: 179.99,
    category: 'Clothing',
    imageUrl: 'https://example.com/images/patagonia-fleece.jpg',
  },
];

/**
 * Seed the database with sample product data
 */
async function seedProducts(): Promise<void> {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing products
    await prisma.product.deleteMany();
    console.log('🗑️  Cleared existing products');

    // Insert sample products
    const createdProducts = await prisma.product.createMany({
      data: sampleProducts,
    });

    console.log(`✅ Successfully created ${createdProducts.count} products`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

/**
 * Main seeding function
 */
async function main(): Promise<void> {
  try {
    await seedProducts();
    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('💥 Database seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  main();
}

export default main;