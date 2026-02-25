import { Product } from '@prisma/client';
import { prisma } from '../config/database';
import { ProductsQuery } from '../models/product.model';
import { createLogger } from '../utils/logger';

const logger = createLogger({ module: 'ProductRepository' });

/**
 * Product repository interface
 */
export interface IProductRepository {
  findMany(query: ProductsQuery): Promise<{ products: Product[]; total: number }>;
  findById(id: string): Promise<Product | null>;
  create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product>;
  update(id: string, data: Partial<Product>): Promise<Product>;
  delete(id: string): Promise<void>;
}

/**
 * Prisma implementation of Product repository
 */
export class ProductRepository implements IProductRepository {
  /**
   * Find products with filtering and pagination
   */
  async findMany(query: ProductsQuery): Promise<{ products: Product[]; total: number }> {
    const { page, limit, category, minPrice, maxPrice, search } = query;
    
    logger.debug('Finding products with query', { query });

    // Build where clause
    const where: any = {};
    
    if (category) {
      where.category = {
        equals: category,
        mode: 'insensitive',
      };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          category: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    try {
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy: [
            { createdAt: 'desc' },
            { id: 'asc' }, // Secondary sort for consistent pagination
          ],
        }),
        prisma.product.count({ where }),
      ]);

      logger.debug('Found products', { count: products.length, total });

      return { products, total };
    } catch (error) {
      logger.error('Error finding products', error);
      throw error;
    }
  }

  /**
   * Find product by ID
   */
  async findById(id: string): Promise<Product | null> {
    logger.debug('Finding product by ID', { id });

    try {
      const product = await prisma.product.findUnique({
        where: { id },
      });

      logger.debug('Product found', { found: !!product, id });

      return product;
    } catch (error) {
      logger.error('Error finding product by ID', { error, id });
      throw error;
    }
  }

  /**
   * Create new product
   */
  async create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    logger.debug('Creating product', { name: data.name });

    try {
      const product = await prisma.product.create({
        data,
      });

      logger.info('Product created', { id: product.id, name: product.name });

      return product;
    } catch (error) {
      logger.error('Error creating product', { error, data });
      throw error;
    }
  }

  /**
   * Update product
   */
  async update(id: string, data: Partial<Product>): Promise<Product> {
    logger.debug('Updating product', { id, fields: Object.keys(data) });

    try {
      const product = await prisma.product.update({
        where: { id },
        data,
      });

      logger.info('Product updated', { id: product.id, name: product.name });

      return product;
    } catch (error) {
      logger.error('Error updating product', { error, id, data });
      throw error;
    }
  }

  /**
   * Delete product
   */
  async delete(id: string): Promise<void> {
    logger.debug('Deleting product', { id });

    try {
      await prisma.product.delete({
        where: { id },
      });

      logger.info('Product deleted', { id });
    } catch (error) {
      logger.error('Error deleting product', { error, id });
      throw error;
    }
  }
}