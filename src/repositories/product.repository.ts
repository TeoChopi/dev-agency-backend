import { PrismaClient, Product, Prisma } from '@prisma/client';
import { CreateProductInput, UpdateProductInput, ProductQuery, PaginatedProducts } from '@/models/product.model';
import { logger } from '@/utils/logger';

export interface IProductRepository {
  create(data: CreateProductInput): Promise<Product>;
  findById(id: number): Promise<Product | null>;
  findAll(query: ProductQuery): Promise<PaginatedProducts>;
  update(id: number, data: UpdateProductInput): Promise<Product>;
  delete(id: number): Promise<void>;
  exists(id: number): Promise<boolean>;
}

export class ProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateProductInput): Promise<Product> {
    try {
      const product = await this.prisma.product.create({
        data,
      });

      logger.info({ productId: product.id }, 'Product created successfully');
      return product;
    } catch (error) {
      logger.error(error, 'Failed to create product');
      throw error;
    }
  }

  async findById(id: number): Promise<Product | null> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
      });

      return product;
    } catch (error) {
      logger.error({ productId: id, error }, 'Failed to find product by ID');
      throw error;
    }
  }

  async findAll(query: ProductQuery): Promise<PaginatedProducts> {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        search,
        sort = 'createdAt',
        order = 'desc',
      } = query;

      const skip = (page - 1) * limit;

      const where: Prisma.ProductWhereInput = {
        ...(category && { category }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { category: { contains: search, mode: 'insensitive' } },
          ],
        }),
      };

      const orderBy: Prisma.ProductOrderByWithRelationInput = {
        [sort]: order,
      };

      const [products, total] = await Promise.all([
        this.prisma.product.findMany({
          where,
          orderBy,
          skip,
          take: limit,
        }),
        this.prisma.product.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      logger.error({ query, error }, 'Failed to find products');
      throw error;
    }
  }

  async update(id: number, data: UpdateProductInput): Promise<Product> {
    try {
      const product = await this.prisma.product.update({
        where: { id },
        data,
      });

      logger.info({ productId: id }, 'Product updated successfully');
      return product;
    } catch (error) {
      logger.error({ productId: id, error }, 'Failed to update product');
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.prisma.product.delete({
        where: { id },
      });

      logger.info({ productId: id }, 'Product deleted successfully');
    } catch (error) {
      logger.error({ productId: id, error }, 'Failed to delete product');
      throw error;
    }
  }

  async exists(id: number): Promise<boolean> {
    try {
      const count = await this.prisma.product.count({
        where: { id },
      });

      return count > 0;
    } catch (error) {
      logger.error({ productId: id, error }, 'Failed to check if product exists');
      throw error;
    }
  }
}