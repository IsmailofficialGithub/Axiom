import { Router } from 'express';
import validate from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/authenticate.middleware.js';
import { onboardInvestorSchema, onboardStartupSchema } from './users.dto.js';
import * as usersController from './users.controller.js';
import ApiError from '../../utils/ApiError.js';
const router = Router();
// Middleware to dynamically select the correct schema based on user role
const validateOnboarding = (req, res, next) => {
    const role = req.user?.role;
    if (role === 'investor') {
        return validate(onboardInvestorSchema)(req, res, next);
    }
    else if (role === 'startup') {
        return validate(onboardStartupSchema)(req, res, next);
    }
    return next(new ApiError(403, 'Admins do not need to onboard'));
};
// Protected routes (Require Authentication)
router.use(authenticate);
/**
 * @openapi
 * /api/v1/users/onboard:
 *   post:
 *     summary: Onboard a user (Investor or Startup)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: User onboarded successfully
 */
router.post('/onboard', validateOnboarding, usersController.onboardUser);
/**
 * @openapi
 * /api/v1/users/profile:
 *   get:
 *     summary: Get my profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 */
router.get('/profile', usersController.getMyProfile);
router.patch('/profile/details', usersController.updateMyProfileDetails);
export default router;
