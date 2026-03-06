import express from 'express';
import {
    getAllShippingTiers,
    calculateShippingCost
} from '../controllers/shippingTier.controller';

const router = express.Router();

// Client shipping routes
router.get('/calculate', calculateShippingCost);
router.get('/', getAllShippingTiers);

export default router;
