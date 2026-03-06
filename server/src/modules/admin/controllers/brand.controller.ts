import { NextFunction, Request, Response } from 'express';
import { Brand } from '../../../models/brand.model';
import { ApiError } from '../../../utils/ApiError';
import { asyncHandler } from '../../../utils/asyncHandler';
import { deleteImage } from '../../../utils/cloudinary';
import { BrandService } from '../../../services/brand.service';

export { getAllBrands, getBrandsForDropdown, getBrandById } from "../../client/controllers/brand.controller";

export const createBrand = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.body;
    const file = req.file as Express.Multer.File;

    if (!name) {
        return next(new ApiError(400, 'Brand name is required'));
    }

    if (!file) {
        return next(new ApiError(400, 'Brand image is required'));
    }

    const existingBrand = await BrandService.findBrandByName(name);
    if (existingBrand) {
        return next(new ApiError(400, 'Brand with this name already exists'));
    }

    const brand = await Brand.create({
        name: name.trim(),
        image: file.path,
        imagePublicId: file.filename
    });

    res.status(201).json({
        success: true,
        message: 'Brand created successfully',
        brand
    });
});

export const updateBrand = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { name } = req.body;
    const file = req.file as Express.Multer.File;

    const brand = await Brand.findById(id);

    if (!brand) {
        return next(new ApiError(404, 'Brand not found'));
    }

    if (name && name !== brand.name) {
        const existingBrand = await BrandService.existsOtherThan(name, id);
        if (existingBrand) {
            return next(new ApiError(400, 'Brand with this name already exists'));
        }
        brand.name = name.trim();
    }

    if (file) {
        if (brand.imagePublicId) {
            await deleteImage(brand.imagePublicId);
        }

        brand.image = file.path;
        brand.imagePublicId = file.filename;
    }

    await brand.save();

    res.status(200).json({
        success: true,
        message: 'Brand updated successfully',
        brand
    });
});

export const deleteBrand = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const brand = await Brand.findById(id);

    if (!brand) {
        return next(new ApiError(404, 'Brand not found'));
    }

    if (brand.imagePublicId) {
        await deleteImage(brand.imagePublicId);
    }

    await Brand.findByIdAndDelete(id);

    res.status(200).json({
        success: true,
        message: 'Brand deleted successfully'
    });
});
