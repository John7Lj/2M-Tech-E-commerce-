import express from 'express';
import { getStats } from '../controllers/stats.controller';
import { adminOnly, authenticateUser } from '../../../middleware/auth.middleware';

const router = express.Router();

// Admin stats routes
router.get('/', authenticateUser, adminOnly, getStats);

export default router;
