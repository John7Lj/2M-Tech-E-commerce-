import { Request, Response } from 'express';
import { Category } from '../../../models/category.model';
import { asyncHandler } from '../../../utils/asyncHandler';
import { ApiError } from '../../../utils/ApiError';

export const getAllCategories = asyncHandler(async (req: Request, res: Response) => {
    const categories = await Category.find({ isActive: true }).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        categories
    });
});

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'Category ID is required');
    }

    const category = await Category.findById(id);

    if (!category) {
        throw new ApiError(404, 'Category not found');
    }

    res.status(200).json({
        success: true,
        category
    });
});
