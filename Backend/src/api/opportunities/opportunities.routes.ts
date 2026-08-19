import { Router } from 'express';
import validate from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/authenticate.middleware.js';
import authorize from '../../middleware/authorize.middleware.js';
import { createOpportunitySchema, updateOpportunitySchema } from './opportunities.dto.js';
import * as oppsController from './opportunities.controller.js';

const router = Router();

// All opportunities routes require authentication
router.use(authenticate);

/**
 * @openapi
 * /api/v1/opportunities:
 *   get:
 *     summary: List opportunities
 *     tags: [Opportunities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of opportunities
 */
router.get('/', oppsController.list);

/**
 * @openapi
 * /api/v1/opportunities/{id}:
 *   get:
 *     summary: Get a specific opportunity
 *     tags: [Opportunities]
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
 *         description: Opportunity details
 */
router.get('/:id', oppsController.getById);

/**
 * @openapi
 * /api/v1/opportunities:
 *   post:
 *     summary: Create an opportunity (Startups & Admins only)
 *     tags: [Opportunities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Opportunity created
 */
router.post(
  '/',
  authorize('startup', 'admin'),
  validate(createOpportunitySchema),
  oppsController.create
);

/**
 * @openapi
 * /api/v1/opportunities/{id}:
 *   patch:
 *     summary: Update an opportunity (Startups & Admins only)
 *     tags: [Opportunities]
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
 *         description: Opportunity updated
 */
router.patch(
  '/:id',
  authorize('startup', 'admin'),
  validate(updateOpportunitySchema),
  oppsController.update
);

export default router;
