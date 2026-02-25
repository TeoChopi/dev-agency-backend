import { IProductsRepository } from '../repositories/products.repository';
import { Product, ProductQuery, CreateProduct, UpdateProduct } from '../models/products.schemas';
import { PaginatedResult, PaginationOptions } from '../models/common.types';
import { calculatePaginationOptions, validatePaginationParams } from '../utils/pagination';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/errors';

/**
 * Products service interface
 */
export interface IProductsService {
  getProducts(query: ProductQuery): Promise<PaginatedResult<Product>>;
  getProductById(id: string): Promise<Product>;
  createProduct(data: CreateProduct): Promise<Product>;
  updateProduct(id: string, data: UpdateProduct): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
}

/**
 * Products service implementation
 */
export class ProductsService implements IProductsService {
  constructor(private readonly productsRepository: IProductsRepository) {}

  /**
   * Get paginated products with filters
   */
  async getProducts(query: ProductQuery): Promise<PaginatedResult<Product>> {
    try {
      // Validate pagination parameters
      validatePaginationParams(query.page, query.limit);

      // Calculate pagination options
      const paginationOptions = calculatePaginationOptions(query);

      // Extract filters from query
      const filters = {
        search: query.search,
        category: query.category,
        minPrice: query.minPrice,
        maxPrice: query.maxPrice,
        isActive: query.isActive,
      };

      // Get paginated results
      const result = await this.productsRepository.findMany(paginationOptions, filters);

      logger.info('Retrieved products successfully', {
        page: query.page,
        limit: query.limit,
        total: result.total,
        itemsCount: result.items.length,
      });

      return result;
    } catch (error) {
      logger.error('Failed to get products', { error, query });
      
      if (error instanceof Error && error.message.includes('Page must be') || error.message.includes('Limit must be')) {
        throw new ApiError(error.message, 400, 'INVALID_PAGINATION_PARAMS');
      }
      
      throw new ApiError('Failed to retrieve products', 500, 'PRODUCTS_FETCH_ERROR');
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(id: string): Promise<Product> {
    try {
      if (!id) {
        throw new ApiError('Product ID is required', 400, 'INVALID_PRODUCT_ID');
      }

      const product = await this.productsRepository.findById(id);
      
      if (!product) {
        throw new ApiError('Product not found', 404, 'PRODUCT_NOT_FOUND');
      }

      logger.info('Retrieved product by ID', { productId: id });
      return product;
    } catch (error) {
      logger.error('Failed to get product by ID', { error, id });
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError('Failed to retrieve product', 500, 'PRODUCT_FETCH_ERROR');
    }
  }

  /**
   * Create new product
   */
  async createProduct(data: CreateProduct): Promise<Product> {
    try {
      // Validate business rules
      await this.validateProductData(data);

      const product = await this.productsRepository.create(data);

      logger.info('Created product successfully', { productId: product.id });
      return product;
    } catch (error) {
      logger.error('Failed to create product', { error, data });
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError('Failed to create product', 500, 'PRODUCT_CREATE_ERROR');
    }
  }

  /**
   * Update product by ID
   */
  async updateProduct(id: string, data: UpdateProduct): Promise<Product> {
    try {
      if (!id) {
        throw new ApiError('Product ID is required', 400, 'INVALID_PRODUCT_ID');
      }

      // Validate business rules if data is provided
      if (Object.keys(data).length > 0) {
        await this.validateProductData(data);
      }

      const product = await this.productsRepository.update(id, data);
      
      if (!product) {
        throw new ApiError('Product not found', 404, 'PRODUCT_NOT_FOUND');
      }

      logger.info('Updated product successfully', { productId: id });
      return product;
    } catch (error) {
      logger.error('Failed to update product', { error, id, data });
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError('Failed to update product', 500, 'PRODUCT_UPDATE_ERROR');
    }
  }

  /**
   * Delete product by ID
   */
  async deleteProduct(id: string): Promise<void> {
    try {
      if (!id) {
        throw new ApiError('Product ID is required', 400, 'INVALID_PRODUCT_ID');
      }

      const deleted = await this.productsRepository.delete(id);
      
      if (!deleted) {
        throw new ApiError('Product not found', 404, 'PRODUCT_NOT_FOUND');
      }

      logger.info('Deleted product successfully', { productId: id });
    } catch (error) {
      logger.error('Failed to delete product', { error, id });
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError('Failed to delete product', 500, 'PRODUCT_DELETE_ERROR');
    }
  }

  /**
   * Validate product data for business rules
   */
  private async validateProductData(data: Partial<CreateProduct>): Promise<void> {
    // Example business validations
    if (data.price !== undefined && data.price < 0) {
      throw new ApiError('Product price cannot be negative', 400, 'INVALID_PRICE');
    }

    if (data.stock !== undefined && data.stock < 0) {
      throw new ApiError('Product stock cannot be negative', 400, 'INVALID_STOCK');
    }

    if (data.name && data.name.trim().length === 0) {
      throw new ApiError('Product name cannot be empty', 400, 'INVALID_NAME');
    }

    if (data.category && data.category.trim().length === 0) {
      throw new ApiError('Product category cannot be empty', 400, 'INVALID_CATEGORY');
    }
  }
}