import mongoose from "mongoose";

export const CouponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, "Please enter coupon code"],
        unique: true,
    },
    amount: {
        type: Number,
        required: [true, "Please enter discount amount"],
        min: [1, "Coupon amount must be at least 1"],
    },
    expiresAt: {
        type: Date,
        default: null,
    },
    maxUses: {
        type: Number,
        default: null, // null = unlimited
    },
    usedCount: {
        type: Number,
        default: 0,
    },
    minOrderValue: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

export default mongoose.model("Coupon", CouponSchema);