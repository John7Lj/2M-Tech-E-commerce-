import { Request, Response } from 'express';
import ShippingTier from '../../../models/shippingTier.model';
import { asyncHandler } from '../../../utils/asyncHandler';
import { ApiError } from '../../../utils/ApiError';

export const getAllShippingTiers = asyncHandler(async (req: Request, res: Response) => {
    const shippingTiers = await ShippingTier.find({ isActive: true })
        .sort({ minOrderValue: 1 });

    res.status(200).json({
        success: true,
        shippingTiers
    });
});

export const calculateShippingCost = asyncHandler(async (req: Request, res: Response) => {
    const { orderValue } = req.query;

    if (!orderValue || isNaN(Number(orderValue))) {
        throw new ApiError(400, 'Valid order value is required');
    }

    const orderVal = Number(orderValue);

    const shippingTier = await ShippingTier.findOne({
        isActive: true,
        minOrderValue: { $lte: orderVal },
        maxOrderValue: { $gt: orderVal }
    });

    const shippingCost = shippingTier ? shippingTier.shippingCost : 0;

    res.status(200).json({
        success: true,
        orderValue: orderVal,
        shippingCost,
        appliedTier: shippingTier ? {
            minOrderValue: shippingTier.minOrderValue,
            maxOrderValue: shippingTier.maxOrderValue,
            cost: shippingTier.shippingCost
        } : null
    });
});
