import { Request, Response } from 'express';
import ShippingTier from '../../../models/shippingTier.model';
export { getAllShippingTiers } from "../../client/controllers/shippingTier.controller";
import { asyncHandler } from '../../../utils/asyncHandler';
import { ApiError } from '../../../utils/ApiError';

export const createShippingTier = asyncHandler(async (req: Request, res: Response) => {
    const { minOrderValue, maxOrderValue, shippingCost } = req.body;

    if (minOrderValue === undefined || minOrderValue === null) {
        throw new ApiError(400, 'Minimum order value is required');
    }
    if (maxOrderValue === undefined || maxOrderValue === null) {
        throw new ApiError(400, 'Maximum order value is required');
    }
    if (shippingCost === undefined || shippingCost === null) {
        throw new ApiError(400, 'Shipping cost is required');
    }

    const minVal = Number(minOrderValue);
    const maxVal = Number(maxOrderValue);
    const costVal = Number(shippingCost);

    if (isNaN(minVal) || isNaN(maxVal) || isNaN(costVal)) {
        throw new ApiError(400, 'All values must be valid numbers');
    }

    if (minVal < 0 || maxVal < 0 || costVal < 0) {
        throw new ApiError(400, 'Values cannot be negative');
    }

    if (maxVal <= minVal) {
        throw new ApiError(400, 'Maximum order value must be greater than minimum order value');
    }

    const overlappingTier = await ShippingTier.findOne({
        isActive: true,
        $or: [
            {
                $and: [
                    { minOrderValue: { $lt: maxVal } },
                    { maxOrderValue: { $gt: minVal } }
                ]
            }
        ]
    });

    if (overlappingTier) {
        throw new ApiError(400, `Order value range ${minVal}-${maxVal} overlaps with existing tier ${overlappingTier.minOrderValue}-${overlappingTier.maxOrderValue}`);
    }

    const shippingTier = await ShippingTier.create({
        minOrderValue: minVal,
        maxOrderValue: maxVal,
        shippingCost: costVal
    });

    res.status(201).json({
        success: true,
        message: 'Shipping tier created successfully',
        shippingTier
    });
});

export const updateShippingTier = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { minOrderValue, maxOrderValue, shippingCost } = req.body;

    const existingTier = await ShippingTier.findById(id);
    if (!existingTier) {
        throw new ApiError(404, 'Shipping tier not found');
    }

    const newMinValue = minOrderValue !== undefined ? Number(minOrderValue) : existingTier.minOrderValue;
    const newMaxValue = maxOrderValue !== undefined ? Number(maxOrderValue) : existingTier.maxOrderValue;
    const newShippingCost = shippingCost !== undefined ? Number(shippingCost) : existingTier.shippingCost;

    if (isNaN(newMinValue) || isNaN(newMaxValue) || isNaN(newShippingCost)) {
        throw new ApiError(400, 'All values must be valid numbers');
    }

    if (newMinValue < 0 || newMaxValue < 0 || newShippingCost < 0) {
        throw new ApiError(400, 'Values cannot be negative');
    }

    if (newMaxValue <= newMinValue) {
        throw new ApiError(400, 'Maximum order value must be greater than minimum order value');
    }

    const overlappingTier = await ShippingTier.findOne({
        _id: { $ne: id },
        isActive: true,
        $or: [
            {
                $and: [
                    { minOrderValue: { $lt: newMaxValue } },
                    { maxOrderValue: { $gt: newMinValue } }
                ]
            }
        ]
    });

    if (overlappingTier) {
        throw new ApiError(400, `Order value range ${newMinValue}-${newMaxValue} overlaps with existing tier ${overlappingTier.minOrderValue}-${overlappingTier.maxOrderValue}`);
    }

    const updatedTier = await ShippingTier.findByIdAndUpdate(
        id,
        {
            minOrderValue: newMinValue,
            maxOrderValue: newMaxValue,
            shippingCost: newShippingCost
        },
        { new: true, runValidators: false }
    );

    res.status(200).json({
        success: true,
        message: 'Shipping tier updated successfully',
        shippingTier: updatedTier
    });
});

export const deleteShippingTier = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const shippingTier = await ShippingTier.findById(id);
    if (!shippingTier) {
        throw new ApiError(404, 'Shipping tier not found');
    }

    await ShippingTier.findByIdAndDelete(id);

    res.status(200).json({
        success: true,
        message: 'Shipping tier deleted successfully'
    });
});
