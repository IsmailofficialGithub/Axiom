const ApiError = require('../utils/ApiError');

/**
 * Middleware to authorize requests based on user roles.
 * Must be used AFTER the authenticate middleware.
 * 
 * @param {...string} roles - Allowed roles (e.g., 'admin', 'investor', 'startup')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(new ApiError(401, 'Unauthorized: User not authenticated or role missing'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, `Forbidden: Requires one of the following roles: ${roles.join(', ')}`));
    }

    next();
  };
};

module.exports = authorize;
