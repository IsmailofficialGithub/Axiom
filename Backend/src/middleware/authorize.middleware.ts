import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError.js';

/**
 * Middleware to authorize requests based on user roles.
 * Must be used AFTER the authenticate middleware.
 * 
 * @param roles - Allowed roles (e.g., 'admin', 'investor', 'startup')
 */
const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role) {
      return next(new ApiError(401, 'Unauthorized: User not authenticated or role missing'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, `Forbidden: Requires one of the following roles: ${roles.join(', ')}`));
    }

    next();
  };
};

export default authorize;
