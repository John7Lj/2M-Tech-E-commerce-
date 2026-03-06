import { ApiError } from "../../../utils/ApiError";
import { asyncHandler } from "../../../utils/asyncHandler";
import Coupon from "../../../models/coupon.model";

// Apply Coupon
export const applyCoupon = asyncHandler(async (req, res, next) => {
    const { code, orderTotal } = req.body;

    if (!code) {
        return next(new ApiError(400, 'Please provide coupon code'));
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });

    if (!coupon) {
        return next(new ApiError(404, 'Invalid coupon code'));
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        return next(new ApiError(400, 'This coupon has expired'));
    }

    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
        return next(new ApiError(400, 'This coupon has reached its usage limit'));
    }

    if (coupon.minOrderValue > 0) {
        if (orderTotal === undefined || orderTotal === null) {
            return next(new ApiError(400, 'Order total is required to validate this coupon'));
        }
        if (Number(orderTotal) < coupon.minOrderValue) {
            return next(new ApiError(400, `Minimum order value for this coupon is ${coupon.minOrderValue}`));
        }
    }

    return res.status(200).json({
        success: true,
        discount: coupon.amount,
        code: coupon.code,
        message: 'Coupon applied successfully'
    });
});
