import { Request, Response } from 'express';
import { Subcategory } from '../../../models/subcategory.model';
import { asyncHandler } from '../../../utils/asyncHandler';
import { ApiError } from '../../../utils/ApiError';
import mongoose from 'mongoose';

export const getAllSubcategories = asyncHandler(async (req: Request, res: Response) => {
    const subcategories = await Subcategory.find({ isActive: true })
        .populate('parentCategory', 'name _id')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        subcategories
    });
});

export const getSubcategoriesByCategory = asyncHandler(async (req: Request, res: Response) => {
    const { categoryId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        throw new ApiError(400, 'Invalid category ID');
    }

    const subcategories = await Subcategory.find({
        parentCategory: categoryId,
        isActive: true
    }).sort({ name: 1 });

    res.status(200).json({
        success: true,
        subcategories
    });
});

export const getSubcategory = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, 'Invalid subcategory ID');
    }

    const subcategory = await Subcategory.findById(id)
        .populate('parentCategory', 'name _id');

    if (!subcategory) {
        throw new ApiError(404, 'Subcategory not found');
    }

    res.status(200).json({
        success: true,
        subcategory
    });
});
