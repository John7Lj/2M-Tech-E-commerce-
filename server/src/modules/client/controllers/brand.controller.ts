import { NextFunction, Request, Response } from 'express';
import { Brand } from '../../../models/brand.model';
import { ApiError } from '../../../utils/ApiError';
import { asyncHandler } from '../../../utils/asyncHandler';

export const getAllBrands = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [brands, totalBrands] = await Promise.all([
        Brand.find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Brand.countDocuments({})
    ]);

    const totalPages = Math.ceil(totalBrands / limit);

    res.status(200).json({
        success: true,
        brands,
        totalBrands,
        totalPages,
        currentPage: page
    });
});

export const getBrandById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const brand = await Brand.findById(id);

    if (!brand) {
        return next(new ApiError(404, 'Brand not found'));
    }

    res.status(200).json({
        success: true,
        brand
    });
});

export const getBrandsForDropdown = asyncHandler(async (req: Request, res: Response) => {
    const brands = await Brand.find({}, 'name _id image').sort({ name: 1 });

    res.status(200).json({
        success: true,
        brands
    });
});
