import { IProductsRepository } from '../repositories/products.repository';
import { Product, ProductQuery, CreateProduct, UpdateProduct } from '../models/products.schemas';
import { PaginatedResult, PaginationOptions } from '../models/common.types';
import { calculatePaginationOptions, validatePaginationParams, generatePaginationCacheKey } from '../utils/pagination';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/errors';
import { RedisService } from '../utils/redis';

/**
 * Products service interface
 */
export interface IProductsService {
  getProducts(query: ProductQuery, requestId?: string): Promise<PaginatedResult<Product>>;
  getProductById(id: string, requestId?: string): Promise<Product>;
  createProduct(data: CreateProduct, requestId?: string): Promise<Product>;
  updateProduct(id: string, data: UpdateProduct, requestId?: string): Promise<Product>;
  deleteProduct(id: string, requestId?: string): Promise<void>;
}

/**
 * Products service implementation with caching support
 */
export class ProductsService implements IProductsService {
  private readonly cacheService: RedisService;
  private readonly cacheTTL = 300; // 5 minutes cache

  constructor(
    private readonly productsRepository: IProductsRepository,
    cacheService?: RedisService
  ) {
    this.cacheService = cacheService || new RedisService();
  }

  /**
   * Get paginated products with filters and caching
   */
  async getProducts(query: ProductQuery, requestId?: string): Promise<PaginatedResult<Product>> {
    const logContext = { requestId, query };
    
    try {
      // Validate pagination parameters
      validatePaginationParams(query.page, query.limit);

      // Check cache for frequently accessed pages
      const cacheKey = generatePaginationCacheKey('products', query.page, query.limit, {
        search: query.search,
        category: query.category,
        minPrice: query.minPrice,
        maxPrice: query.maxPrice,
        isActive: query.isActive,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      });

      try {
        const cachedResult = await this.cacheService.get<PaginatedResult<Product>>(cacheKey);
        if (cachedResult) {
          logger.info('Retrieved products from cache', { ...logContext, cacheKey });
          return cachedResult;
        }
      } catch (cacheError) {
        logger.warn('Cache retrieval failed, continuing with database query', { 
          ...logContext, 
          cacheError: cacheError instanceof Error ? cacheError.message : 'Unknown cache error' 
        });
      }

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

      // Cache the result for frequently accessed pages (first 10 pages)
      if (query.page <= 10) {
        try {
          await this.cacheService.set(cacheKey, result, this.cacheTTL);
        } catch (cacheError) {
          logger.warn('Failed to cache result', { 
            ...logContext, 
            cacheError: cacheError instanceof Error ? cacheError.message : 'Unknown cache error' 
          });
        }
      }

      logger.info('Retrieved products successfully', {
        ...logContext,
        total: result.total,
        itemsCount: result.items.length,
      });

      return result;
    } catch (error) {
      logger.error('Failed to get products', { ...logContext, error });
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError('Failed to retrieve products', 500, 'PRODUCTS_FETCH_ERROR');
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(id: string, requestId?: string): Promise<Product> {
    const logContext = { requestId, productId: id };
    
    try {
      if (!id) {
        throw new ApiError('Product ID is required', 400, 'INVALID_PRODUCT_ID');
      }

      const product = await this.productsRepository.findById(id);
      
      if (!product) {
        throw new ApiError('Product not found', 404, 'PRODUCT_NOT_FOUND');
      }

      logger.info('Retrieved product by ID', logContext);
      return product;
    } catch (error) {
      logger.error('Failed to get product by ID', { ...logContext, error });
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError('Failed to retrieve product', 500, 'PRODUCT_FETCH_ERROR');
    }
  }

  /**
   * Create new product
   */
  async createProduct(data: CreateProduct, requestId?: string): Promise<Product> {
    const logContext = { requestId, productData: data };
    
    try {
      // Validate business rules
      await this.validateProductData(data);

      const product = await this.productsRepository.create(data);

      // Invalidate cache after creation
      await this.invalidateProductsCache();

      logger.info('Created product successfully', { ...logContext, productId: product.id });
      return product;
    } catch (error) {
      logger.error('Failed to create product', { ...logContext, error });
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError('Failed to create product', 500, 'PRODUCT_CREATE_ERROR');
    }
  }

  /**
   * Update product by ID
   */
  async updateProduct(id: string, data: UpdateProduct, requestId?: string): Promise<Product> {
    const logContext = { requestId, productId: id, updateData: data };
    
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

      // Invalidate cache after update
      await this.invalidateProductsCache();

      logger.info('Updated product successfully', logContext);
      return product;
    } catch (error) {
      logger.error('Failed to update product', { ...logContext, error });
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError('Failed to update product', 500, 'PRODUCT_UPDATE_ERROR');
    }
  }

  /**
   * Delete product by ID
   */
  async deleteProduct(id: string, requestId?: string): Promise<void> {
    const logContext = { requestId, productId: id };
    
    try {
      if (!id) {
        throw new ApiError('Product ID is required', 400, 'INVALID_PRODUCT_ID');
      }

      const deleted = await this.productsRepository.delete(id);
      
      if (!deleted) {
        throw new ApiError('Product not found', 404, 'PRODUCT_NOT_FOUND');
      }

      // Invalidate cache after deletion
      await this.invalidateProductsCache();

      logger.info('Deleted product successfully', logContext);
    } catch (error) {
      logger.error('Failed to delete product', { ...logContext, error });
      
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

  /**
   * Invalidate products cache
   */
  private async invalidateProductsCache(): Promise<void> {
    try {
      await this.cacheService.deleteByPattern('products:page:*');
    } catch (error) {
      logger.warn('Failed to invalidate products cache', { error });
    }
  }
}