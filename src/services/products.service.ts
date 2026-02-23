import { Product as PrismaProduct } from '@prisma/client';
import { ProductsRepository } from '../repositories/products.repository';
import { CreateProductInput, UpdateProductInput, PaginationQuery } from '../models/product.model';
import { NotFoundError, ConflictError } from '../utils/errors';

export interface ProductsService {
  getProducts(pagination: PaginationQuery): Promise<{
    products: PrismaProduct[];
    total: number;
    page: number;
    limit: number;
  }>;
  getProductById(id: string): Promise<PrismaProduct>;
  createProduct(data: CreateProductInput): Promise<PrismaProduct>;
  updateProduct(id: string, data: UpdateProductInput): Promise<PrismaProduct>;
  deleteProduct(id: string): Promise<void>;
}

export class ProductsServiceImpl implements ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  /**
   * Get paginated products
   */
  async getProducts(pagination: PaginationQuery): Promise<{
    products: PrismaProduct[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.productsRepository.findAll(skip, limit),
      this.productsRepository.count(),
    ]);

    return {
      products,
      total,
      page,
      limit,
    };
  }

  /**
   * Get product by ID
   */
  async getProductById(id: string): Promise<PrismaProduct> {
    const product = await this.productsRepository.findById(id);

    if (!product) {
      throw new NotFoundError(`Product with ID ${id} not found`, 'PRODUCT_NOT_FOUND');
    }

    return product;
  }

  /**
   * Create a new product
   */
  async createProduct(data: CreateProductInput): Promise<PrismaProduct> {
    // Check if SKU already exists
    const existingProduct = await this.productsRepository.findBySku(data.sku);
    if (existingProduct) {
      throw new ConflictError(`Product with SKU ${data.sku} already exists`, 'SKU_ALREADY_EXISTS');
    }

    return this.productsRepository.create(data);
  }

  /**
   * Update an existing product
   */
  async updateProduct(id: string, data: UpdateProductInput): Promise<PrismaProduct> {
    // Check if product exists
    const existingProduct = await this.productsRepository.findById(id);
    if (!existingProduct) {
      throw new NotFoundError(`Product with ID ${id} not found`, 'PRODUCT_NOT_FOUND');
    }

    // Check if SKU is being updated and already exists
    if (data.sku && data.sku !== existingProduct.sku) {
      const productWithSku = await this.productsRepository.findBySku(data.sku);
      if (productWithSku && productWithSku.id !== id) {
        throw new ConflictError(`Product with SKU ${data.sku} already exists`, 'SKU_ALREADY_EXISTS');
      }
    }

    return this.productsRepository.update(id, data);
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: string): Promise<void> {
    // Check if product exists
    const existingProduct = await this.productsRepository.findById(id);
    if (!existingProduct) {
      throw new NotFoundError(`Product with ID ${id} not found`, 'PRODUCT_NOT_FOUND');
    }

    await this.productsRepository.delete(id);
  }
}