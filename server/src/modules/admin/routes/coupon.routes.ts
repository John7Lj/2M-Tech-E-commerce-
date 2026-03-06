import express from 'express';
import {
    newCoupon,
    deleteCoupon,
    getAllCoupons
} from '../controllers/coupon.controller';
import { adminOnly, authenticateUser } from '../../../middleware/auth.middleware';

const router = express.Router();

// All admin coupon routes are protected
router.use(authenticateUser, adminOnly);

router.post('/new', newCoupon);
router.delete('/delete/:id', deleteCoupon);
router.get('/all', getAllCoupons);

export default router;
