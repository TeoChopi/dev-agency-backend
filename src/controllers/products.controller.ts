import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';
import { ProductsQuery, PaginatedResponse, ApiResponse } from '../models/product.model';
import { HTTP_STATUS, MESSAGES } from '../utils/constants';
import { createLogger } from '../utils/logger';
import { Product } from '@prisma/client';

const logger = createLogger({ module: 'ProductsController' });

/**
 * Products controller
 */
class ProductsController {
  constructor(private readonly productService: ProductService = new ProductService()) {}

  /**
   * Get products with optional pagination and filtering
   */
  async getProducts(
    req: Request<{}, PaginatedResponse<Product>, {}, ProductsQuery>,
    res: Response<PaginatedResponse<Product>>
  ): Promise<void> {
    const query = req.query;

    logger.debug('Getting products', { query });

    try {
      const result = await this.productService.getProducts(query);

      logger.info('Products fetched successfully', {
        count: result.data.length,
        page: result.pagination.page,
        total: result.pagination.total,
      });

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      logger.error('Error getting products', { error, query });
      throw error; // Will be handled by error middleware
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(
    req: Request<{ id: string }>,
    res: Response<ApiResponse<Product>>
  ): Promise<void> {
    const { id } = req.params;

    logger.debug('Getting product by ID', { id });

    try {
      const product = await this.productService.getProductById(id);

      logger.info('Product fetched successfully', { id, name: product.name });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: product,
      });
    } catch (error) {
      logger.error('Error getting product by ID', { error, id });
      throw error; // Will be handled by error middleware
    }
  }
}

export const productsController = new ProductsController();