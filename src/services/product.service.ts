import { Product } from '@prisma/client';
import { IProductRepository, ProductRepository } from '../repositories/product.repository';
import { ProductsQuery, PaginatedResponse } from '../models/product.model';
import { createLogger } from '../utils/logger';
import { createNotFoundError } from '../utils/errors';
import { MESSAGES } from '../utils/constants';

const logger = createLogger({ module: 'ProductService' });

/**
 * Product service interface
 */
export interface IProductService {
  getProducts(query: ProductsQuery): Promise<PaginatedResponse<Product>>;
  getProductById(id: string): Promise<Product>;
}

/**
 * Product service implementation
 */
export class ProductService implements IProductService {
  constructor(private readonly productRepository: IProductRepository = new ProductRepository()) {}

  /**
   * Get products with filtering and pagination
   */
  async getProducts(query: ProductsQuery): Promise<PaginatedResponse<Product>> {
    logger.debug('Getting products', { query });

    try {
      const { products, total } = await this.productRepository.findMany(query);
      
      const { page, limit } = query;
      const pages = Math.ceil(total / limit);
      const hasNext = page < pages;
      const hasPrev = page > 1;

      const paginatedResponse: PaginatedResponse<Product> = {
        success: true,
        data: products,
        pagination: {
          page,
          limit,
          total,
          pages,
          hasNext,
          hasPrev,
        },
      };

      logger.info('Products retrieved successfully', {
        count: products.length,
        total,
        page,
        pages,
      });

      return paginatedResponse;
    } catch (error) {
      logger.error('Error getting products', { error, query });
      throw error;
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(id: string): Promise<Product> {
    logger.debug('Getting product by ID', { id });

    try {
      const product = await this.productRepository.findById(id);
      
      if (!product) {
        throw createNotFoundError(`Product with ID ${id} not found`);
      }

      logger.info('Product retrieved successfully', { id, name: product.name });

      return product;
    } catch (error) {
      logger.error('Error getting product by ID', { error, id });
      throw error;
    }
  }
}