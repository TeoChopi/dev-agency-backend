import { PrismaClient } from '@prisma/client';
import { logger } from '../src/utils/logger';

const prisma = new PrismaClient();

const sampleProducts = [
  {
    name: 'iPhone 15 Pro',
    description: 'Latest iPhone with A17 Pro chip and titanium design',
    price: 999.99,
    category: 'Electronics',
    brand: 'Apple',
    sku: 'IPHONE15PRO-001',
    stock: 50,
    imageUrl: 'https://example.com/images/iphone15pro.jpg',
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Premium Android smartphone with S Pen and 200MP camera',
    price: 1199.99,
    category: 'Electronics',
    brand: 'Samsung',
    sku: 'GALAXY-S24-ULTRA',
    stock: 30,
    imageUrl: 'https://example.com/images/galaxys24ultra.jpg',
  },
  {
    name: 'MacBook Air M3',
    description: '13-inch laptop with M3 chip, perfect for productivity',
    price: 1299.99,
    category: 'Electronics',
    brand: 'Apple',
    sku: 'MACBOOK-AIR-M3',
    stock: 25,
    imageUrl: 'https://example.com/images/macbookairm3.jpg',
  },
  {
    name: 'Sony WH-1000XM5',
    description: 'Premium noise-canceling wireless headphones',
    price: 399.99,
    category: 'Electronics',
    brand: 'Sony',
    sku: 'SONY-WH1000XM5',
    stock: 100,
    imageUrl: 'https://example.com/images/sonywh1000xm5.jpg',
  },
  {
    name: 'Nike Air Max 270',
    description: 'Comfortable running shoes with Max Air cushioning',
    price: 150.00,
    category: 'Footwear',
    brand: 'Nike',
    sku: 'NIKE-AIRMAX270',
    stock: 75,
    imageUrl: 'https://example.com/images/nikeairmax270.jpg',
  },
  {
    name: 'Adidas Ultraboost 22',
    description: 'High-performance running shoes with Boost technology',
    price: 180.00,
    category: 'Footwear',
    brand: 'Adidas',
    sku: 'ADIDAS-UB22',
    stock: 60,
    imageUrl: 'https://example.com/images/adidasultraboost22.jpg',
  },
  {
    name: 'Levi\'s 501 Original Jeans',
    description: 'Classic straight-leg jeans in premium denim',
    price: 89.99,
    category: 'Clothing',
    brand: 'Levi\'s',
    sku: 'LEVIS-501-ORIG',
    stock: 120,
    imageUrl: 'https://example.com/images/levis501.jpg',
  },
  {
    name: 'The North Face Venture 2 Jacket',
    description: 'Waterproof and breathable rain jacket for outdoor activities',
    price: 99.99,
    category: 'Clothing',
    brand: 'The North Face',
    sku: 'TNF-VENTURE2',
    stock: 45,
    imageUrl: 'https://example.com/images/tnfventure2.jpg',
  },
  {
    name: 'KitchenAid Stand Mixer',
    description: 'Professional 5-quart stand mixer for baking enthusiasts',
    price: 399.99,
    category: 'Home & Kitchen',
    brand: 'KitchenAid',
    sku: 'KITCHENAID-5QT',
    stock: 20,
    imageUrl: 'https://example.com/images/kitchenaidmixer.jpg',
  },
  {
    name: 'Dyson V15 Detect',
    description: 'Cordless vacuum cleaner with laser dust detection',
    price: 749.99,
    category: 'Home & Kitchen',
    brand: 'Dyson',
    sku: 'DYSON-V15-DETECT',
    stock: 15,
    imageUrl: 'https://example.com/images/dysonv15.jpg',
  },
  {
    name: 'PlayStation 5',
    description: 'Next-generation gaming console with 4K gaming',
    price: 499.99,
    category: 'Electronics',
    brand: 'Sony',
    sku: 'PS5-CONSOLE',
    stock: 10,
    imageUrl: 'https://example.com/images/ps5.jpg',
  },
  {
    name: 'Xbox Series X',
    description: 'Powerful gaming console with 12 teraflops of processing power',
    price: 499.99,
    category: 'Electronics',
    brand: 'Microsoft',
    sku: 'XBOX-SERIES-X',
    stock: 8,
    imageUrl: 'https://example.com/images/xboxseriesx.jpg',
  },
  {
    name: 'Canon EOS R5',
    description: 'Professional mirrorless camera with 8K video recording',
    price: 3899.99,
    category: 'Electronics',
    brand: 'Canon',
    sku: 'CANON-EOS-R5',
    stock: 5,
    imageUrl: 'https://example.com/images/canonesr5.jpg',
  },
  {
    name: 'Patagonia Houdini Jacket',
    description: 'Ultra-lightweight windbreaker perfect for outdoor adventures',
    price: 129.99,
    category: 'Clothing',
    brand: 'Patagonia',
    sku: 'PATAGONIA-HOUDINI',
    stock: 35,
    imageUrl: 'https://example.com/images/patagoniahoudini.jpg',
  },
  {
    name: 'Instant Pot Duo 7-in-1',
    description: 'Multi-functional pressure cooker for quick and easy meals',
    price: 99.99,
    category: 'Home & Kitchen',
    brand: 'Instant Pot',
    sku: 'INSTANTPOT-DUO-7',
    stock: 40,
    imageUrl: 'https://example.com/images/instantpotduo.jpg',
  },
];

async function main(): Promise<void> {
  logger.info('Starting database seed...');

  try {
    // Clear existing products
    await prisma.product.deleteMany({});
    logger.info('Cleared existing products');

    // Insert sample products
    const createdProducts = await prisma.product.createMany({
      data: sampleProducts,
    });

    logger.info(`Created ${createdProducts.count} products`);
    logger.info('Database seed completed successfully');
  } catch (error) {
    logger.error('Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((error) => {
    logger.error('Fatal error during seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });