import express from 'express';
import {
    getAllOrders,
    deleteOrder,
    updateOrderStatus,
    getOrder
} from '../controllers/order.controller';
import { adminOnly, authenticateUser } from '../../../middleware/auth.middleware';

const router = express.Router();

// All admin order routes are protected
router.use(authenticateUser, adminOnly);

router.get('/all', getAllOrders);
router.get('/:id', getOrder);
router.delete('/delete/:id', deleteOrder);
router.put('/update-status/:id', updateOrderStatus);

export default router;
