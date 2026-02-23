import { PrismaClient, Product as PrismaProduct } from '@prisma/client';
import { CreateProductDto, UpdateProductDto, ProductQuery } from '@/models/product.model';
import { logger } from '@/utils/logger';

export interface IProductRepository {
  create(data: CreateProductDto): Promise<PrismaProduct>;
  findById(id: number): Promise<PrismaProduct | null>;
  findMany(query: ProductQuery): Promise<{ products: PrismaProduct[]; total: number }>;
  update(id: number, data: UpdateProductDto): Promise<PrismaProduct | null>;
  delete(id: number): Promise<boolean>;
  findByCategory(category: string): Promise<PrismaProduct[]>;
}

export class ProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateProductDto): Promise<PrismaProduct> {
    logger.info('Creating new product', { data });
    
    return await this.prisma.product.create({
      data,
    });
  }

  async findById(id: number): Promise<PrismaProduct | null> {
    logger.info('Finding product by ID', { id });
    
    return await this.prisma.product.findUnique({
      where: { id },
    });
  }

  async findMany(query: ProductQuery): Promise<{ products: PrismaProduct[]; total: number }> {
    logger.info('Finding products with query', { query });
    
    const { page, limit, category, in_stock, search, sort, order } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (in_stock !== undefined) {
      where.in_stock = in_stock;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { products, total };
  }

  async update(id: number, data: UpdateProductDto): Promise<PrismaProduct | null> {
    logger.info('Updating product', { id, data });
    
    const existingProduct = await this.findById(id);
    if (!existingProduct) {
      return null;
    }

    return await this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<boolean> {
    logger.info('Deleting product', { id });
    
    const existingProduct = await this.findById(id);
    if (!existingProduct) {
      return false;
    }

    await this.prisma.product.delete({
      where: { id },
    });

    return true;
  }

  async findByCategory(category: string): Promise<PrismaProduct[]> {
    logger.info('Finding products by category', { category });
    
    return await this.prisma.product.findMany({
      where: { category },
    });
  }
}