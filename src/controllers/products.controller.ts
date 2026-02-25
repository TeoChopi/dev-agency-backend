import { Request, Response, NextFunction } from 'express';
import { IProductsService } from '../services/products.service';
import { ProductQuerySchema, CreateProductSchema, UpdateProductSchema } from '../models/products.schemas';
import { PaginatedResponse } from '../models/common.types';
import { createPaginationMeta } from '../utils/pagination';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/errors';
import { generateRequestId } from '../utils/request';

/**
 * Products controller handling HTTP requests
 */
export class ProductsController {
  constructor(private readonly productsService: IProductsService) {}

  /**
   * Get paginated products with filters
   * GET /api/products
   */
  getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const requestId = generateRequestId();
    
    try {
      // Validate query parameters
      const queryResult = ProductQuerySchema.safeParse(req.query);
      
      if (!queryResult.success) {
        throw new ApiError(
          `Invalid query parameters: ${queryResult.error.errors.map(e => e.message).join(', ')}`,
          400,
          'INVALID_QUERY_PARAMS'
        );
      }

      const query = queryResult.data;

      // Get paginated products
      const result = await this.productsService.getProducts(query, requestId);

      // Create pagination metadata
      const pagination = createPaginationMeta(
        query.page,
        query.limit,
        result.total
      );

      // Send paginated response
      const response: PaginatedResponse<typeof result.items[0]> = {
        success: true,
        data: result.items,
        pagination,
      };

      logger.info('Products retrieved successfully', {
        requestId,
        page: query.page,
        limit: query.limit,
        total: result.total,
        itemsReturned: result.items.length,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
      });

      res.status(200).json(response);
    } catch (error) {
      logger.error('Products retrieval failed', { requestId, error });
      next(error);
    }
  };

  /**
   * Get product by ID
   * GET /api/products/:id
   */
  getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const requestId = generateRequestId();
    
    try {
      const { id } = req.params;

      if (!id || typeof id !== 'string') {
        throw new ApiError('Product ID is required', 400, 'INVALID_PRODUCT_ID');
      }

      const product = await this.productsService.getProductById(id, requestId);

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      logger.error('Product retrieval by ID failed', { requestId, productId: req.params.id, error });
      next(error);
    }
  };

  /**
   * Create new product
   * POST /api/products
   */
  createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const requestId = generateRequestId();
    
    try {
      // Validate request body
      const bodyResult = CreateProductSchema.safeParse(req.body);
      
      if (!bodyResult.success) {
        throw new ApiError(
          `Invalid product data: ${bodyResult.error.errors.map(e => e.message).join(', ')}`,
          400,
          'INVALID_PRODUCT_DATA'
        );
      }

      const productData = bodyResult.data;

      // Create product
      const product = await this.productsService.createProduct(productData, requestId);

      logger.info('Product created successfully', { requestId, productId: product.id });

      res.status(201).json({
        success: true,
        data: product,
      });
    } catch (error) {
      logger.error('Product creation failed', { requestId, productData: req.body, error });
      next(error);
    }
  };

  /**
   * Update product by ID
   * PUT /api/products/:id
   */
  updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const requestId = generateRequestId();
    
    try {
      const { id } = req.params;

      if (!id || typeof id !== 'string') {
        throw new ApiError('Product ID is required', 400, 'INVALID_PRODUCT_ID');
      }

      // Validate request body
      const bodyResult = UpdateProductSchema.safeParse(req.body);
      
      if (!bodyResult.success) {
        throw new ApiError(
          `Invalid product data: ${bodyResult.error.errors.map(e => e.message).join(', ')}`,
          400,
          'INVALID_PRODUCT_DATA'
        );
      }

      const updateData = bodyResult.data;

      // Update product
      const product = await this.productsService.updateProduct(id, updateData, requestId);

      logger.info('Product updated successfully', { requestId, productId: id });

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      logger.error('Product update failed', { requestId, productId: req.params.id, updateData: req.body, error });
      next(error);
    }
  };

  /**
   * Delete product by ID
   * DELETE /api/products/:id
   */
  deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const requestId = generateRequestId();
    
    try {
      const { id } = req.params;

      if (!id || typeof id !== 'string') {
        throw new ApiError('Product ID is required', 400, 'INVALID_PRODUCT_ID');
      }

      // Delete product
      await this.productsService.deleteProduct(id, requestId);

      logger.info('Product deleted successfully', { requestId, productId: id });

      res.status(204).send();
    } catch (error) {
      logger.error('Product deletion failed', { requestId, productId: req.params.id, error });
      next(error);
    }
  };
}