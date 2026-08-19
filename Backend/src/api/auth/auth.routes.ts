import { Router } from 'express';
import validate from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/authenticate.middleware.js';
import { loginSchema, registerSchema } from './auth.dto.js';
import * as authController from './auth.controller.js';

import rateLimit from 'express-rate-limit';

const router = Router();

// Strict rate limiter for login attempts (Brute Force Protection based on Device Info)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP + Device combination to 5 login requests per window
  message: { message: 'Too many login attempts from this device/IP, please try again after 15 minutes' },
  keyGenerator: (req) => {
    // Generate a unique key based on IP, User-Agent, and custom frontend fingerprint
    const ip = req.ip;
    const userAgent = req.headers['user-agent'] || 'unknown';
    const deviceFingerprint = req.headers['x-device-fingerprint'] || 'unknown';
    return `${ip}_${userAgent}_${deviceFingerprint}`;
  },
});

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - full_name
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               full_name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [startup, investor, admin]
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     parameters:
 *       - in: header
 *         name: x-device-fingerprint
 *         schema:
 *           type: string
 *         description: Frontend generated device fingerprint for rate limiting
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 */
router.post('/login', loginLimiter, validate(loginSchema), authController.login);

// Protected routes
// The getMe route requires a valid JWT
router.get('/me', authenticate, authController.getMe);

export default router;
