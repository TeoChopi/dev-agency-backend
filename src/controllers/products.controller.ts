import { Request, Response } from 'express';
import { ProductsService } from '../services/products.service';
import { PaginationQuerySchema } from '../models/product.model';
import { createPaginatedResponse, createSuccessResponse } from '../utils/response';
import { ValidationError } from '../utils/errors';

export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * Get all products with pagination
   * GET /api/v1/products
   */
  getProducts = async (req: Request, res: Response): Promise<void> => {
    // Validate query parameters
    const validationResult = PaginationQuerySchema.safeParse(req.query);
    
    if (!validationResult.success) {
      throw new ValidationError(
        `Invalid query parameters: ${validationResult.error.errors.map(e => e.message).join(', ')}`,
        'INVALID_QUERY_PARAMS'
      );
    }

    const { page, limit } = validationResult.data;

    const result = await this.productsService.getProducts({ page, limit });

    const response = createPaginatedResponse(
      result.products,
      result.total,
      result.page,
      result.limit
    );

    res.status(200).json(response);
  };

  /**
   * Get product by ID
   * GET /api/v1/products/:id
   */
  getProductById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    
    if (!id) {
      throw new ValidationError('Product ID is required', 'MISSING_PRODUCT_ID');
    }

    const product = await this.productsService.getProductById(id);
    const response = createSuccessResponse(product);

    res.status(200).json(response);
  };
}