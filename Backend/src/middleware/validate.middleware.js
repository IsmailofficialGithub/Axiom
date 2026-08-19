const ApiError = require('../utils/ApiError');

/**
 * Validates request data (body, query, params) against Zod schemas.
 * @param {Object} schema - Object containing Zod schemas for body, query, or params.
 */
const validate = (schema) => (req, res, next) => {
  try {
    if (schema.params) {
      req.params = schema.params.parse(req.params);
    }
    if (schema.query) {
      req.query = schema.query.parse(req.query);
    }
    if (schema.body) {
      req.body = schema.body.parse(req.body);
    }
    return next();
  } catch (error) {
    if (error.name === 'ZodError') {
      const errorMessage = error.errors.map((details) => `${details.path.join('.')}: ${details.message}`).join(', ');
      return next(new ApiError(400, errorMessage));
    }
    return next(error);
  }
};

module.exports = validate;
