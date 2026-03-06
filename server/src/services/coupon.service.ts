import Coupon from "../models/coupon.model";
import { ApiError } from "../utils/ApiError";

export class CouponService {
    /**
     * Validate a coupon code and return the coupon object
     */
    static async validateCoupon(code: string, subTotal: number) {
        if (!code) return null;

        const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });

        if (!coupon) {
            throw new ApiError(400, "Coupon code is no longer valid");
        }

        if (coupon.expiresAt && coupon.expiresAt < new Date()) {
            throw new ApiError(400, "This coupon has expired");
        }

        if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
            throw new ApiError(400, "This coupon has reached its usage limit");
        }

        if (subTotal < coupon.minOrderValue) {
            throw new ApiError(400, `Minimum order value for this coupon is ${coupon.minOrderValue}`);
        }

        return coupon;
    }

    /**
     * Increment coupon usage count
     */
    static async useCoupon(couponId: string) {
        await Coupon.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } });
    }
}
