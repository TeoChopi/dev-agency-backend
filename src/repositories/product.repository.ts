import { PrismaClient, Product as PrismaProduct, Prisma } from '@prisma/client';
import { CreateProductDto, UpdateProductDto, ProductQuery } from '@/models/product.model';

export interface ProductRepository {
  findMany(query: ProductQuery): Promise<{ products: PrismaProduct[]; total: number }>;
  findById(id: number): Promise<PrismaProduct | null>;
  create(data: CreateProductDto): Promise<PrismaProduct>;
  update(id: number, data: UpdateProductDto): Promise<PrismaProduct>;
  delete(id: number): Promise<PrismaProduct>;
}

export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findMany(query: ProductQuery): Promise<{ products: PrismaProduct[]; total: number }> {
    const { page, limit, category, search, sortBy, sortOrder } = query;
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
      [sortBy]: sortOrder,
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

    return { products, total };
  }

  async findById(id: number): Promise<PrismaProduct | null> {
    return this.prisma.product.findUnique({
      where: { id },
    });
  }

  async create(data: CreateProductDto): Promise<PrismaProduct> {
    return this.prisma.product.create({
      data,
    });
  }

  async update(id: number, data: UpdateProductDto): Promise<PrismaProduct> {
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<PrismaProduct> {
    return this.prisma.product.delete({
      where: { id },
    });
  }
}