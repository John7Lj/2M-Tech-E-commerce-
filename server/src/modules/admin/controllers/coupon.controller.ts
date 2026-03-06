import { ApiError } from "../../../utils/ApiError";
import { asyncHandler } from "../../../utils/asyncHandler";
import Coupon from "../../../models/coupon.model";

// Create New Coupon
export const newCoupon = asyncHandler(async (req, res, next) => {
    const { code, amount, expiresAt, maxUses, minOrderValue } = req.body;

    if (!code || !amount) {
        return next(new ApiError(400, 'Please fill all fields'));
    }

    if (Number(amount) <= 0) {
        return next(new ApiError(400, 'Coupon amount must be greater than 0'));
    }

    if (expiresAt) {
        const expiry = new Date(expiresAt);
        if (isNaN(expiry.getTime())) {
            return next(new ApiError(400, 'Invalid expiry date'));
        }
        if (expiry <= new Date()) {
            return next(new ApiError(400, 'Expiry date must be in the future'));
        }
    }

    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (existingCoupon) {
        return next(new ApiError(409, 'A coupon with this code already exists'));
    }

    await Coupon.create({
        code: code.toUpperCase().trim(),
        amount: Number(amount),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        maxUses: maxUses ? Number(maxUses) : null,
        minOrderValue: minOrderValue ? Number(minOrderValue) : 0,
    });

    return res.status(201).json({
        success: true,
        message: 'Coupon created successfully',
    });
});

// Delete Coupon
export const deleteCoupon = asyncHandler(async (req, res, next) => {
    const couponId = req.params.id;

    const coupon = await Coupon.findByIdAndDelete(couponId);

    if (!coupon) {
        return next(new ApiError(404, 'Coupon not found'));
    }

    return res.status(200).json({
        success: true,
        message: 'Coupon deleted successfully'
    });
});

// getAllCoupons
export const getAllCoupons = asyncHandler(async (req, res, next) => {
    const coupons = await Coupon.find().sort({ createdAt: -1 });

    return res.status(200).json({
        success: true,
        coupons
    });
});
