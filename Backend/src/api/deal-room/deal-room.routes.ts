import { Router } from 'express';
import validate from '../../middleware/validate.middleware.js';
import authenticate from '../../middleware/authenticate.middleware.js';
import authorize from '../../middleware/authorize.middleware.js';
import { uploadDocumentSchema, grantPermissionSchema } from './deal-room.dto.js';
import * as dealRoomController from './deal-room.controller.js';

const router = Router();

// All deal-room routes require authentication
router.use(authenticate);

router.get('/investors', authorize('startup', 'admin'), dealRoomController.listInvestors);

/**
 * @openapi
 * /api/v1/deal-room/opportunities/{opportunityId}/documents:
 *   get:
 *     summary: Get documents for a specific opportunity
 *     tags: [Deal Room]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: opportunityId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of documents
 */
router.get('/opportunities/:opportunityId/documents', dealRoomController.listDocuments);

/**
 * @openapi
 * /api/v1/deal-room/opportunities/{opportunityId}/documents:
 *   post:
 *     summary: Add a document to an opportunity (Startups/Admins only)
 *     tags: [Deal Room]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: opportunityId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Document added
 */
router.post(
  '/opportunities/:opportunityId/documents',
  authorize('startup', 'admin'),
  validate(uploadDocumentSchema),
  dealRoomController.addDocument
);

/**
 * @openapi
 * /api/v1/deal-room/opportunities/{opportunityId}/permissions:
 *   post:
 *     summary: Grant an investor access to an opportunity's private deal room (Startups/Admins only)
 *     tags: [Deal Room]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: opportunityId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Access granted
 */
router.post(
  '/opportunities/:opportunityId/permissions',
  authorize('startup', 'admin'),
  validate(grantPermissionSchema),
  dealRoomController.grantAccess
);

export default router;
