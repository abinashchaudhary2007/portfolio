import express from 'express';
import { trackVisit, getStats, getCharts, getVisitors } from '../controllers/analyticsController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public endpoint to track visitors
router.post('/track', trackVisit);

// Protected endpoints for dashboard
router.get('/stats', protectAdmin, getStats);
router.get('/charts', protectAdmin, getCharts);
router.get('/visitors', protectAdmin, getVisitors);

export default router;
