import { Router } from 'express';
import validate from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/authenticate.middleware.js';
import authorize from '../../middleware/authorize.middleware.js';
import { createOpportunitySchema, updateOpportunitySchema } from './opportunities.dto.js';
import * as oppsController from './opportunities.controller.js';

const router = Router();

// All opportunities routes require authentication
router.use(authenticate);

// List opportunities (Investors & Startups & Admins can access, service layer filters what they see)
router.get('/', oppsController.list);

// Get specific opportunity (Service layer handles view permissions)
router.get('/:id', oppsController.getById);

// Create opportunity (Only Startups and Admins can create)
router.post(
  '/',
  authorize('startup', 'admin'),
  validate(createOpportunitySchema),
  oppsController.create
);

// Update opportunity (Only Startups and Admins can update)
router.patch(
  '/:id',
  authorize('startup', 'admin'),
  validate(updateOpportunitySchema),
  oppsController.update
);

export default router;
