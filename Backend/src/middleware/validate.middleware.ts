import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny } from 'zod';
import ApiError from '../utils/ApiError.js';

/**
 * Validates request data (body, query, params) against Zod schemas.
 * @param schema - Object containing Zod schemas for body, query, or params.
 */
const validate = (schema: { body?: ZodTypeAny, query?: ZodTypeAny, params?: ZodTypeAny }) => 
  (req: Request, res: Response, next: NextFunction) => {
  try {
    if (schema.params) {
      req.params = schema.params.parse(req.params) as any;
    }
    if (schema.query) {
      req.query = schema.query.parse(req.query) as any;
    }
    if (schema.body) {
      req.body = schema.body.parse(req.body);
    }
    return next();
  } catch (error: any) {
    if (error.name === 'ZodError') {
      const errorMessage = error.errors.map((details: any) => `${details.path.join('.')}: ${details.message}`).join(', ');
      return next(new ApiError(400, errorMessage));
    }
    return next(error);
  }
};

export default validate;
