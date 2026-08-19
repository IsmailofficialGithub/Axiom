import { Router } from 'express';
import validate from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/authenticate.middleware.js';
import authorize from '../../middleware/authorize.middleware.js';
import { uploadDocumentSchema, grantPermissionSchema } from './deal-room.dto.js';
import * as dealRoomController from './deal-room.controller.js';

const router = Router();

// All deal-room routes require authentication
router.use(authenticate);

// 1. Get documents for a specific opportunity
router.get('/opportunities/:opportunityId/documents', dealRoomController.listDocuments);

// 2. Add a document to an opportunity (Startups/Admins only)
router.post(
  '/opportunities/:opportunityId/documents',
  authorize('startup', 'admin'),
  validate(uploadDocumentSchema),
  dealRoomController.addDocument
);

// 3. Grant an investor access to an opportunity's private deal room (Startups/Admins only)
router.post(
  '/opportunities/:opportunityId/permissions',
  authorize('startup', 'admin'),
  validate(grantPermissionSchema),
  dealRoomController.grantAccess
);

export default router;
