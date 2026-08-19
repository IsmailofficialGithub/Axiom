import { Router, Request, Response, NextFunction } from 'express';
import validate from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/authenticate.middleware.js';
import { onboardInvestorSchema, onboardStartupSchema } from './users.dto.js';
import * as usersController from './users.controller.js';
import ApiError from '../../utils/ApiError.js';

const router = Router();

// Middleware to dynamically select the correct schema based on user role
const validateOnboarding = (req: Request, res: Response, next: NextFunction) => {
  const role = req.user?.role;
  if (role === 'investor') {
    return validate(onboardInvestorSchema)(req, res, next);
  } else if (role === 'startup') {
    return validate(onboardStartupSchema)(req, res, next);
  }
  return next(new ApiError(403, 'Admins do not need to onboard'));
};

// Protected routes (Require Authentication)
router.use(authenticate);

// POST /api/v1/users/onboard
router.post('/onboard', validateOnboarding, usersController.onboardUser);

// GET /api/v1/users/profile
router.get('/profile', usersController.getMyProfile);

export default router;
