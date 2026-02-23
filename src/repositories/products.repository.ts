import { PrismaClient, Product as PrismaProduct } from '@prisma/client';
import { CreateProductInput, UpdateProductInput } from '../models/product.model';

export interface ProductsRepository {
  findAll(skip: number, take: number): Promise<PrismaProduct[]>;
  count(): Promise<number>;
  findById(id: string): Promise<PrismaProduct | null>;
  findBySku(sku: string): Promise<PrismaProduct | null>;
  create(data: CreateProductInput): Promise<PrismaProduct>;
  update(id: string, data: UpdateProductInput): Promise<PrismaProduct>;
  delete(id: string): Promise<void>;
}

export class PrismaProductsRepository implements ProductsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Find all products with pagination
   */
  async findAll(skip: number, take: number): Promise<PrismaProduct[]> {
    return this.prisma.product.findMany({
      skip,
      take,
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Count total active products
   */
  async count(): Promise<number> {
    return this.prisma.product.count({
      where: {
        isActive: true,
      },
    });
  }

  /**
   * Find product by ID
   */
  async findById(id: string): Promise<PrismaProduct | null> {
    return this.prisma.product.findUnique({
      where: { id },
    });
  }

  /**
   * Find product by SKU
   */
  async findBySku(sku: string): Promise<PrismaProduct | null> {
    return this.prisma.product.findUnique({
      where: { sku },
    });
  }

  /**
   * Create a new product
   */
  async create(data: CreateProductInput): Promise<PrismaProduct> {
    return this.prisma.product.create({
      data,
    });
  }

  /**
   * Update an existing product
   */
  async update(id: string, data: UpdateProductInput): Promise<PrismaProduct> {
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a product (soft delete by setting isActive to false)
   */
  async delete(id: string): Promise<void> {
    await this.prisma.product.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }
}