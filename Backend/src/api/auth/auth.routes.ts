import { Router } from 'express';
import validate from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/authenticate.middleware.js';
import { loginSchema, registerSchema } from './auth.dto.js';
import * as authController from './auth.controller.js';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

// Protected routes
// The getMe route requires a valid JWT
router.get('/me', authenticate, authController.getMe);

export default router;
