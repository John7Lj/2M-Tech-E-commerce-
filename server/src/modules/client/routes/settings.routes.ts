import express from 'express';
import { getSettings } from '../controllers/settings.controller';

const router = express.Router();

// Client settings routes
router.get('/', getSettings);

export default router;
