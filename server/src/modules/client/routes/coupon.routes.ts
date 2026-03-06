import express from 'express';
import {
    applyCoupon
} from '../controllers/coupon.controller';
import { authenticateUser } from '../../../middleware/auth.middleware';

const router = express.Router();

// Client apply coupon is protected
router.post('/apply', authenticateUser, applyCoupon);

export default router;
