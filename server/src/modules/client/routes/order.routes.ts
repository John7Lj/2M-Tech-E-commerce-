import express from 'express';
import {
    newOrder,
    getUserOrders,
    getOrder
} from '../controllers/order.controller';
import { authenticateUser } from '../../../middleware/auth.middleware';

const router = express.Router();

// Client order routes are protected
router.use(authenticateUser);

router.post('/new', newOrder);
router.get('/my', getUserOrders);
router.get('/:id', getOrder);

export default router;
