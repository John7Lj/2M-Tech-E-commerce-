import { Request, Response } from 'express';
import { Subcategory } from '../../../models/subcategory.model';
export { getAllSubcategories, getSubcategoriesByCategory, getSubcategory } from "../../client/controllers/subcategory.controller";
import { Category } from '../../../models/category.model';
import { asyncHandler } from '../../../utils/asyncHandler';
import { ApiError } from '../../../utils/ApiError';
import { deleteImage, extractPublicId } from '../../../utils/cloudinary';
import mongoose from 'mongoose';

export const createSubcategory = asyncHandler(async (req: Request, res: Response) => {
    const { name, description, parentCategory } = req.body;

    if (!name || !name.trim()) {
        throw new ApiError(400, 'Subcategory name is required');
    }

    if (!parentCategory) {
        throw new ApiError(400, 'Parent category is required');
    }

    if (!mongoose.Types.ObjectId.isValid(parentCategory)) {
        throw new ApiError(400, 'Invalid parent category ID');
    }

    const categoryExists = await Category.findById(parentCategory);
    if (!categoryExists) {
        throw new ApiError(404, 'Parent category not found');
    }

    const existingSubcategory = await Subcategory.findOne({
        name: name.trim(),
        parentCategory
    });

    if (existingSubcategory) {
        throw new ApiError(400, 'Subcategory with this name already exists in this category');
    }

    let imageUrl = null;
    if (req.file) {
        imageUrl = (req.file as any).path;
    }

    const subcategoryData = {
        name: name.trim(),
        description: description?.trim(),
        parentCategory,
        image: imageUrl
    };

    const subcategory = await Subcategory.create(subcategoryData);
    const populatedSubcategory = await Subcategory.findById(subcategory._id)
        .populate('parentCategory', 'name _id');

    res.status(201).json({
        success: true,
        message: 'Subcategory created successfully',
        subcategory: populatedSubcategory
    });
});

export const updateSubcategory = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, parentCategory, isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, 'Invalid subcategory ID');
    }

    const subcategory = await Subcategory.findById(id);
    if (!subcategory) {
        throw new ApiError(404, 'Subcategory not found');
    }

    if (parentCategory && parentCategory !== subcategory.parentCategory.toString()) {
        if (!mongoose.Types.ObjectId.isValid(parentCategory)) {
            throw new ApiError(400, 'Invalid parent category ID');
        }

        const categoryExists = await Category.findById(parentCategory);
        if (!categoryExists) {
            throw new ApiError(404, 'Parent category not found');
        }
    }

    if (name && name.trim()) {
        const existingSubcategory = await Subcategory.findOne({
            _id: { $ne: id },
            name: name.trim(),
            parentCategory: parentCategory || subcategory.parentCategory
        });

        if (existingSubcategory) {
            throw new ApiError(400, 'Subcategory with this name already exists in this category');
        }
    }

    let imageUrl = subcategory.image;
    if (req.file) {
        if (subcategory.image) {
            const oldPublicId = extractPublicId(subcategory.image);
            if (oldPublicId) {
                await deleteImage(oldPublicId);
            }
        }
        imageUrl = (req.file as any).path;
    }

    const updateData: any = {};

    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (parentCategory !== undefined) updateData.parentCategory = parentCategory;
    if (imageUrl !== subcategory.image) updateData.image = imageUrl;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedSubcategory = await Subcategory.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
    ).populate('parentCategory', 'name _id');

    res.status(200).json({
        success: true,
        message: 'Subcategory updated successfully',
        subcategory: updatedSubcategory
    });
});

export const deleteSubcategory = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, 'Invalid subcategory ID');
    }

    const subcategory = await Subcategory.findById(id);
    if (!subcategory) {
        throw new ApiError(404, 'Subcategory not found');
    }

    try {
        const Product = require('../../../models/product.model').Product;
        const productsCount = await Product.countDocuments({
            subcategories: subcategory._id
        });

        if (productsCount > 0) {
            throw new ApiError(400, `Cannot delete subcategory. ${productsCount} products are using this subcategory`);
        }
    } catch (error: any) {
        if (error instanceof ApiError) throw error;
    }

    await Subcategory.findByIdAndUpdate(id, { isActive: false });

    res.status(200).json({
        success: true,
        message: 'Subcategory deleted successfully'
    });
});

export const permanentDeleteSubcategory = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, 'Invalid subcategory ID');
    }

    const subcategory = await Subcategory.findById(id);
    if (!subcategory) {
        throw new ApiError(404, 'Subcategory not found');
    }

    try {
        const Product = require('../../../models/product.model').Product;
        const productsCount = await Product.countDocuments({
            subcategories: subcategory._id
        });

        if (productsCount > 0) {
            throw new ApiError(400, `Cannot delete subcategory. ${productsCount} products are using this subcategory`);
        }
    } catch (error: any) {
        if (error instanceof ApiError) throw error;
    }

    if (subcategory.image) {
        const publicId = extractPublicId(subcategory.image);
        if (publicId) {
            await deleteImage(publicId);
        }
    }

    await Subcategory.findByIdAndDelete(id);

    res.status(200).json({
        success: true,
        message: 'Subcategory permanently deleted'
    });
});
