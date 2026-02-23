import { Request, Response } from 'express';
import { ProductService } from '@/services/product.service';
import { ResponseHandler } from '@/utils/response';
import { CreateProductDto, UpdateProductDto, ProductQuery } from '@/models/product.model';

export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /**
   * Get all products
   */
  async getAllProducts(req: Request, res: Response): Promise<Response> {
    const query = req.query as unknown as ProductQuery;
    const { products, total } = await this.productService.getAllProducts(query);

    const pagination = {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    };

    return ResponseHandler.success(res, products, 200, pagination);
  }

  /**
   * Get a single product by ID
   */
  async getProductById(req: Request, res: Response): Promise<Response> {
    const id = parseInt(req.params.id as string);
    const product = await this.productService.getProductById(id);
    return ResponseHandler.success(res, product);
  }

  /**
   * Create a new product
   */
  async createProduct(req: Request, res: Response): Promise<Response> {
    const data: CreateProductDto = req.body;
    const product = await this.productService.createProduct(data);
    return ResponseHandler.created(res, product);
  }

  /**
   * Update an existing product
   */
  async updateProduct(req: Request, res: Response): Promise<Response> {
    const id = parseInt(req.params.id as string);
    const data: UpdateProductDto = req.body;
    const product = await this.productService.updateProduct(id, data);
    return ResponseHandler.success(res, product);
  }

  /**
   * Delete a product
   */
  async deleteProduct(req: Request, res: Response): Promise<Response> {
    const id = parseInt(req.params.id as string);
    await this.productService.deleteProduct(id);
    return ResponseHandler.noContent(res);
  }
}