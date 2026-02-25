import { PrismaClient, Prisma } from '@prisma/client';
import { Product, ProductQuery, CreateProduct, UpdateProduct } from '../models/products.schemas';
import { PaginatedResult, PaginationOptions } from '../models/common.types';
import { logger } from '../utils/logger';

/**
 * Products repository interface
 */
export interface IProductsRepository {
  findMany(options: PaginationOptions, filters?: Partial<ProductQuery>): Promise<PaginatedResult<Product>>;
  findById(id: string): Promise<Product | null>;
  create(data: CreateProduct): Promise<Product>;
  update(id: string, data: UpdateProduct): Promise<Product | null>;
  delete(id: string): Promise<boolean>;
  count(filters?: Partial<ProductQuery>): Promise<number>;
}

/**
 * Products repository implementation using Prisma
 */
export class ProductsRepository implements IProductsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Find products with pagination and filters
   */
  async findMany(
    options: PaginationOptions,
    filters?: Partial<ProductQuery>
  ): Promise<PaginatedResult<Product>> {
    try {
      const where = this.buildWhereClause(filters);
      const orderBy = this.buildOrderByClause(options.sortBy, options.sortOrder);

      const [items, total] = await Promise.all([
        this.prisma.product.findMany({
          where,
          skip: options.skip,
          take: options.take,
          orderBy,
        }),
        this.prisma.product.count({ where }),
      ]);

      logger.info(`Retrieved ${items.length} products out of ${total} total`, {
        skip: options.skip,
        take: options.take,
        filters,
      });

      return {
        items: items.map(this.mapPrismaToProduct),
        total,
      };
    } catch (error) {
      logger.error('Failed to find products', { error, options, filters });
      throw new Error('Failed to retrieve products');
    }
  }

  /**
   * Find product by ID
   */
  async findById(id: string): Promise<Product | null> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        return null;
      }

      return this.mapPrismaToProduct(product);
    } catch (error) {
      logger.error('Failed to find product by ID', { error, id });
      throw new Error('Failed to retrieve product');
    }
  }

  /**
   * Create new product
   */
  async create(data: CreateProduct): Promise<Product> {
    try {
      const product = await this.prisma.product.create({
        data: {
          ...data,
          id: undefined, // Let Prisma generate the ID
        },
      });

      logger.info('Created new product', { productId: product.id });
      return this.mapPrismaToProduct(product);
    } catch (error) {
      logger.error('Failed to create product', { error, data });
      throw new Error('Failed to create product');
    }
  }

  /**
   * Update product by ID
   */
  async update(id: string, data: UpdateProduct): Promise<Product | null> {
    try {
      const product = await this.prisma.product.update({
        where: { id },
        data,
      });

      logger.info('Updated product', { productId: id });
      return this.mapPrismaToProduct(product);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null; // Product not found
      }
      logger.error('Failed to update product', { error, id, data });
      throw new Error('Failed to update product');
    }
  }

  /**
   * Delete product by ID
   */
  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.product.delete({
        where: { id },
      });

      logger.info('Deleted product', { productId: id });
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return false; // Product not found
      }
      logger.error('Failed to delete product', { error, id });
      throw new Error('Failed to delete product');
    }
  }

  /**
   * Count products with filters
   */
  async count(filters?: Partial<ProductQuery>): Promise<number> {
    try {
      const where = this.buildWhereClause(filters);
      return await this.prisma.product.count({ where });
    } catch (error) {
      logger.error('Failed to count products', { error, filters });
      throw new Error('Failed to count products');
    }
  }

  /**
   * Build Prisma where clause from filters
   */
  private buildWhereClause(filters?: Partial<ProductQuery>): Prisma.ProductWhereInput {
    if (!filters) return {};

    const where: Prisma.ProductWhereInput = {};

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.category) {
      where.category = { equals: filters.category, mode: 'insensitive' };
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    return where;
  }

  /**
   * Build Prisma orderBy clause
   */
  private buildOrderByClause(
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
  ): Prisma.ProductOrderByWithRelationInput {
    const order = sortOrder || 'desc';
    
    switch (sortBy) {
      case 'name':
        return { name: order };
      case 'price':
        return { price: order };
      case 'category':
        return { category: order };
      case 'stock':
        return { stock: order };
      case 'createdAt':
      default:
        return { createdAt: order };
    }
  }

  /**
   * Map Prisma product to domain model
   */
  private mapPrismaToProduct(prismaProduct: any): Product {
    return {
      id: prismaProduct.id,
      name: prismaProduct.name,
      description: prismaProduct.description,
      price: prismaProduct.price,
      category: prismaProduct.category,
      stock: prismaProduct.stock,
      imageUrl: prismaProduct.imageUrl,
      isActive: prismaProduct.isActive,
      createdAt: prismaProduct.createdAt,
      updatedAt: prismaProduct.updatedAt,
    };
  }
}