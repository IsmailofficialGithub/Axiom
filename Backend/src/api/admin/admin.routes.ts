import { Router } from 'express';
import validate from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/authenticate.middleware.js';
import authorize from '../../middleware/authorize.middleware.js';
import { createSubsidiarySchema, updateUserSchema, updateUserPasswordSchema } from './admin.dto.js';
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

/**
 * @openapi
 * /api/v1/admin/users/{id}:
 *   patch:
 *     summary: Update a user's role or status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.patch('/users/:id', validate(updateUserSchema), adminController.updateUser);

/**
 * @openapi
 * /api/v1/admin/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
router.delete('/users/:id', adminController.deleteUser);

/**
 * @openapi
 * /api/v1/admin/users/{id}/password:
 *   post:
 *     summary: Change a user's password
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 */
router.post('/users/:id/password', validate(updateUserPasswordSchema), adminController.updateUserPassword);

export default router;
