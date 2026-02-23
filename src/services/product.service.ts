import { Product as PrismaProduct } from '@prisma/client';
import { CreateProductDto, UpdateProductDto, ProductQuery } from '@/models/product.model';
import { ProductRepository } from '@/repositories/product.repository';
import { ApiError } from '@/utils/errors';

export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  /**
   * Get all products with pagination and filtering
   */
  async getAllProducts(query: ProductQuery): Promise<{ products: PrismaProduct[]; total: number }> {
    return this.productRepository.findMany(query);
  }

  /**
   * Get a single product by ID
   */
  async getProductById(id: number): Promise<PrismaProduct> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw ApiError.notFound(`Product with ID ${id} not found`);
    }
    return product;
  }

  /**
   * Create a new product
   */
  async createProduct(data: CreateProductDto): Promise<PrismaProduct> {
    return this.productRepository.create(data);
  }

  /**
   * Update an existing product
   */
  async updateProduct(id: number, data: UpdateProductDto): Promise<PrismaProduct> {
    await this.getProductById(id); // Check if product exists
    return this.productRepository.update(id, data);
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: number): Promise<PrismaProduct> {
    await this.getProductById(id); // Check if product exists
    return this.productRepository.delete(id);
  }
}