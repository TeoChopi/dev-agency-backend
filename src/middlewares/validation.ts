import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ApiError } from '@/utils/apiError';

export interface ValidatedRequest<
  TBody = unknown,
  TParams = unknown,
  TQuery = unknown
> extends Request {
  body: TBody;
  params: TParams;
  query: TQuery;
}

export const validate = (schema: {
  body?: AnyZodObject;
  params?: AnyZodObject;
  query?: AnyZodObject;
}) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }

      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params);
      }

      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        throw ApiError.badRequest(
          `Validation failed: ${errorMessages.map(e => `${e.field}: ${e.message}`).join(', ')}`,
          'VALIDATION_ERROR'
        );
      }

      next(error);
    }
  };
};