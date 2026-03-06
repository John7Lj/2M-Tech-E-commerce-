import { NextFunction, Request, Response } from 'express';
import { Category } from '../../../models/category.model';
export { getAllCategories, getCategory } from "../../client/controllers/category.controller";
import { asyncHandler } from '../../../utils/asyncHandler';
import { ApiError } from '../../../utils/ApiError';
import { deleteImage, extractPublicId } from '../../../utils/cloudinary';

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.body;

    if (!name || !name.trim()) {
        throw new ApiError(400, 'Category name is required');
    }

    const existingCategory = await Category.findOne({
        name: name.trim()
    });

    if (existingCategory) {
        throw new ApiError(400, 'Category with this name already exists');
    }

    let imageUrl = null;
    if (req.file) {
        imageUrl = (req.file as any).path;
    }

    const categoryData = {
        name: name.trim(),
        image: imageUrl
    };

    const category = await Category.create(categoryData);

    res.status(201).json({
        success: true,
        message: 'Category created successfully',
        category
    });
});

export const getAllCategoriesAdmin = asyncHandler(async (req: Request, res: Response) => {
    const categories = await Category.find().sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        categories
    });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, isActive } = req.body;

    if (!id) {
        throw new ApiError(400, 'Category ID is required');
    }

    const category = await Category.findById(id);
    if (!category) {
        throw new ApiError(404, 'Category not found');
    }

    if (name && name.trim()) {
        const existingCategory = await Category.findOne({
            _id: { $ne: id },
            name: name.trim()
        });

        if (existingCategory) {
            throw new ApiError(400, 'Category with this name already exists');
        }
    }

    let imageUrl = category.image;
    if (req.file) {
        if (category.image) {
            const oldPublicId = extractPublicId(category.image);
            if (oldPublicId) {
                await deleteImage(oldPublicId);
            }
        }

        imageUrl = (req.file as any).path;
    }

    const updateData: any = {};

    if (name !== undefined) updateData.name = name.trim();
    if (imageUrl !== category.image) updateData.image = imageUrl;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedCategory = await Category.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        message: 'Category updated successfully',
        category: updatedCategory
    });
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'Category ID is required');
    }

    const category = await Category.findById(id);
    if (!category) {
        throw new ApiError(404, 'Category not found');
    }

    try {
        const Product = require('../../../models/product.model').Product;
        const productsCount = await Product.countDocuments({ categories: category._id });

        if (productsCount > 0) {
            throw new ApiError(400, `Cannot delete category. ${productsCount} products are using this category`);
        }
    } catch (error: any) {
        if (error instanceof ApiError) throw error;
    }

    await Category.findByIdAndUpdate(id, { isActive: false });

    res.status(200).json({
        success: true,
        message: 'Category deleted successfully'
    });
});

export const permanentDeleteCategory = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'Category ID is required');
    }

    const category = await Category.findById(id);
    if (!category) {
        throw new ApiError(404, 'Category not found');
    }

    try {
        const Product = require('../../../models/product.model').Product;
        const productsCount = await Product.countDocuments({ categories: category._id });

        if (productsCount > 0) {
            throw new ApiError(400, `Cannot delete category. ${productsCount} products are using this category`);
        }
    } catch (error: any) {
        if (error instanceof ApiError) throw error;
    }

    if (category.image) {
        const publicId = extractPublicId(category.image);
        if (publicId) {
            await deleteImage(publicId);
        }
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json({
        success: true,
        message: 'Category permanently deleted'
    });
});
