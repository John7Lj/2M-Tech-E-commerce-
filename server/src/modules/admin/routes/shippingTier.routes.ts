import express from 'express';
import {
    createShippingTier,
    updateShippingTier,
    deleteShippingTier,
    getAllShippingTiers
} from '../controllers/shippingTier.controller';
import { authenticateUser, adminOnly } from '../../../middleware/auth.middleware';

const router = express.Router();

// Admin shipping tier routes
router.use(authenticateUser, adminOnly);

router.get('/all', getAllShippingTiers);
router.post('/', createShippingTier);
router.put('/:id', updateShippingTier);
router.delete('/:id', deleteShippingTier);

export default router;
