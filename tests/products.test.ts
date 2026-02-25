import request from 'supertest';
import { createServer } from '../src/server';
import { prisma } from '../src/config/database';
import { Application } from 'express';

describe('Products API', () => {
  let app: Application;

  beforeAll(async () => {
    app = createServer();
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /api/v1/products', () => {
    it('should return products with default pagination', async () => {
      const response = await request(app)
        .get('/api/v1/products')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('limit', 20);
    });

    it('should return products with custom pagination', async () => {
      const response = await request(app)
        .get('/api/v1/products?page=2&limit=5')
        .expect(200);

      expect(response.body.pagination.page).toBe(2);
      expect(response.body.pagination.limit).toBe(5);
    });

    it('should filter products by category', async () => {
      const response = await request(app)
        .get('/api/v1/products?category=Electronics')
        .expect(200);

      response.body.data.forEach((product: any) => {
        expect(product.category).toBe('Electronics');
      });
    });

    it('should filter products by price range', async () => {
      const response = await request(app)
        .get('/api/v1/products?minPrice=100&maxPrice=500')
        .expect(200);

      response.body.data.forEach((product: any) => {
        expect(product.price).toBeGreaterThanOrEqual(100);
        expect(product.price).toBeLessThanOrEqual(500);
      });
    });

    it('should search products by name', async () => {
      const response = await request(app)
        .get('/api/v1/products?search=iPhone')
        .expect(200);

      response.body.data.forEach((product: any) => {
        expect(product.name.toLowerCase()).toContain('iphone');
      });
    });

    it('should return 400 for invalid query parameters', async () => {
      const response = await request(app)
        .get('/api/v1/products?page=invalid')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/products/:id', () => {
    it('should return a product by ID', async () => {
      // First, get a product ID from the products list
      const productsResponse = await request(app)
        .get('/api/v1/products?limit=1')
        .expect(200);

      if (productsResponse.body.data.length > 0) {
        const productId = productsResponse.body.data[0].id;

        const response = await request(app)
          .get(`/api/v1/products/${productId}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('id', productId);
        expect(response.body.data).toHaveProperty('name');
        expect(response.body.data).toHaveProperty('price');
        expect(response.body.data).toHaveProperty('category');
      }
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .get('/api/v1/products/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('status', 'ok');
      expect(response.body.data).toHaveProperty('timestamp');
      expect(response.body.data).toHaveProperty('uptime');
      expect(response.body.data).toHaveProperty('environment');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for undefined routes', async () => {
      const response = await request(app)
        .get('/api/v1/undefined-route')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
    });
  });
});