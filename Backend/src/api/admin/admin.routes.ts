import { Router } from 'express';
import validate from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/authenticate.middleware.js';
import authorize from '../../middleware/authorize.middleware.js';
import { createSubsidiarySchema } from './admin.dto.js';
import * as adminController from './admin.controller.js';

const router = Router();

// All admin routes require authentication and the 'admin' role
router.use(authenticate, authorize('admin'));

/**
 * @openapi
 * /api/v1/admin/users:
 *   get:
 *     summary: List all users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users
 */
router.get('/users', adminController.listUsers);

/**
 * @openapi
 * /api/v1/admin/subsidiaries:
 *   get:
 *     summary: List all subsidiaries
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of subsidiaries
 */
router.get('/subsidiaries', adminController.listSubsidiaries);

/**
 * @openapi
 * /api/v1/admin/subsidiaries:
 *   post:
 *     summary: Create a new subsidiary
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - country
 *             properties:
 *               name:
 *                 type: string
 *               country:
 *                 type: string
 *     responses:
 *       201:
 *         description: Subsidiary created successfully
 */
router.post('/subsidiaries', validate(createSubsidiarySchema), adminController.createSubsidiary);

export default router;
