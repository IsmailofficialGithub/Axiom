import { Router } from 'express';
import * as insightsController from './insights.controller.js';
import authenticate from '../../middleware/authenticate.middleware.js';
const router = Router();
// All insights routes require authentication
router.use(authenticate);
router.get('/overview', insightsController.getOverview);
router.get('/top-opportunities', insightsController.getTopOpportunities);
router.get('/sector-trends', insightsController.getSectorTrends);
export default router;
