import { Product as PrismaProduct } from '@prisma/client';
import { IProductRepository } from '@/repositories/product.repository';
import { CreateProductDto, UpdateProductDto, ProductQuery } from '@/models/product.model';
import { ApiError } from '@/utils/api-error';
import { logger } from '@/utils/logger';

export interface IProductService {
  createProduct(data: CreateProductDto): Promise<PrismaProduct>;
  getProductById(id: number): Promise<PrismaProduct>;
  getProducts(query: ProductQuery): Promise<{ products: PrismaProduct[]; total: number }>;
  updateProduct(id: number, data: UpdateProductDto): Promise<PrismaProduct>;
  deleteProduct(id: number): Promise<void>;
  getProductsByCategory(category: string): Promise<PrismaProduct[]>;
}

export class ProductService implements IProductService {
  constructor(private readonly productRepository: IProductRepository) {}

  async createProduct(data: CreateProductDto): Promise<PrismaProduct> {
    logger.info('ProductService: Creating product', { data });

    try {
      const product = await this.productRepository.create(data);
      logger.info('ProductService: Product created successfully', { productId: product.id });
      return product;
    } catch (error) {
      logger.error('ProductService: Failed to create product', { error, data });
      throw ApiError.internal('Failed to create product');
    }
  }

  async getProductById(id: number): Promise<PrismaProduct> {
    logger.info('ProductService: Getting product by ID', { id });

    if (id <= 0) {
      throw ApiError.badRequest('Invalid product ID');
    }

    const product = await this.productRepository.findById(id);
    
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    return product;
  }

  async getProducts(query: ProductQuery): Promise<{ products: PrismaProduct[]; total: number }> {
    logger.info('ProductService: Getting products', { query });

    // Validate pagination parameters
    if (query.page < 1) {
      throw ApiError.badRequest('Page must be greater than 0');
    }

    if (query.limit < 1 || query.limit > 100) {
      throw ApiError.badRequest('Limit must be between 1 and 100');
    }

    try {
      return await this.productRepository.findMany(query);
    } catch (error) {
      logger.error('ProductService: Failed to get products', { error, query });
      throw ApiError.internal('Failed to retrieve products');
    }
  }

  async updateProduct(id: number, data: UpdateProductDto): Promise<PrismaProduct> {
    logger.info('ProductService: Updating product', { id, data });

    if (id <= 0) {
      throw ApiError.badRequest('Invalid product ID');
    }

    // Check if there's any data to update
    if (Object.keys(data).length === 0) {
      throw ApiError.badRequest('No data provided for update');
    }

    try {
      const updatedProduct = await this.productRepository.update(id, data);
      
      if (!updatedProduct) {
        throw ApiError.notFound('Product not found');
      }

      logger.info('ProductService: Product updated successfully', { productId: updatedProduct.id });
      return updatedProduct;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error('ProductService: Failed to update product', { error, id, data });
      throw ApiError.internal('Failed to update product');
    }
  }

  async deleteProduct(id: number): Promise<void> {
    logger.info('ProductService: Deleting product', { id });

    if (id <= 0) {
      throw ApiError.badRequest('Invalid product ID');
    }

    try {
      const deleted = await this.productRepository.delete(id);
      
      if (!deleted) {
        throw ApiError.notFound('Product not found');
      }

      logger.info('ProductService: Product deleted successfully', { productId: id });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error('ProductService: Failed to delete product', { error, id });
      throw ApiError.internal('Failed to delete product');
    }
  }

  async getProductsByCategory(category: string): Promise<PrismaProduct[]> {
    logger.info('ProductService: Getting products by category', { category });

    if (!category.trim()) {
      throw ApiError.badRequest('Category cannot be empty');
    }

    try {
      return await this.productRepository.findByCategory(category);
    } catch (error) {
      logger.error('ProductService: Failed to get products by category', { error, category });
      throw ApiError.internal('Failed to retrieve products by category');
    }
  }
}