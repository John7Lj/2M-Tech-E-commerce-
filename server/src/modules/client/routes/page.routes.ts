import express from 'express';
import {
    getPageBySlug
} from '../controllers/page.controller';

const router = express.Router();

// Client page routes
router.get('/:slug', getPageBySlug);

export default router;
