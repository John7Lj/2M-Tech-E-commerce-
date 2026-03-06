import { ApiError } from "../utils/ApiError";
import { SearchProductsQuery } from "../types/types";
import { Brand } from "../models/brand.model";
import { Category } from "../models/category.model";
import { Subcategory } from "../models/subcategory.model";
import mongoose from "mongoose";

import { escapeRegex } from "../utils/helper";

interface PhotoData {
    photos: string[];
    photoPublicIds: string[];
}

interface FilterQuery {
    category?: string;
    subcategory?: string;
    brand?: string;
}

interface SearchQuery extends FilterQuery {
    search?: string;
    price?: string;
}

export class ProductService {
    /**
     * Standard product population config
     */
    static readonly productPopulate = [
        { path: 'categories', select: 'name _id' },
        { path: 'subcategories', select: 'name _id' },
        { path: 'brand', select: 'name _id' }
    ];

    /**
     * Process uploaded files and validate them
     */
    static async processUploadedFiles(files: Express.Multer.File[]): Promise<PhotoData> {
        if (!files || files.length === 0) throw new ApiError(400, "Please upload at least one photo");
        if (files.length > 10) throw new ApiError(400, "Maximum 10 images allowed");

        const photosData = files.map(file => {
            if (!file.path || !file.filename) throw new ApiError(400, `File upload failed for: ${file.originalname}`);
            return { url: file.path, publicId: file.filename };
        });

        return {
            photos: photosData.map(p => p.url),
            photoPublicIds: photosData.map(p => p.publicId)
        };
    }

    /**
     * Build sort query from sortBy parameter
     */
    static buildSortQuery(sortBy: any): Record<string, 1 | -1> {
        if (!sortBy?.id) return {};
        return { [sortBy.id]: sortBy.desc ? -1 : 1 };
    }

    /**
     * Resolve filter values (ID or slug/name) to ObjectIds
     */
    private static async resolveEntityId(Model: any, value: string): Promise<mongoose.Types.ObjectId | null> {
        if (!value) return null;
        if (mongoose.Types.ObjectId.isValid(value)) return new mongoose.Types.ObjectId(value);

        const entity = await Model.findOne({
            $or: [
                { name: { $regex: escapeRegex(value), $options: 'i' } },
                { value: { $regex: escapeRegex(value), $options: 'i' } }
            ]
        });
        return entity?._id || null;
    }

    /**
     * Build common filter/search logic
     */
    private static async buildCommonQuerySegment(filters: FilterQuery): Promise<Record<string, any>> {
        const query: Record<string, any> = {};

        const [catId, subId, brandId] = await Promise.all([
            this.resolveEntityId(Category, filters.category!),
            this.resolveEntityId(Subcategory, filters.subcategory!),
            this.resolveEntityId(Brand, filters.brand!)
        ]);

        if (catId) query.categories = catId;
        if (subId) query.subcategories = subId;
        if (brandId) query.brand = brandId;

        return query;
    }

    /**
     * Build filter query for products
     */
    static async buildFilterQuery(filters: FilterQuery): Promise<Record<string, any>> {
        return await this.buildCommonQuerySegment(filters);
    }

    /**
     * Build search query with multiple filters
     */
    static async buildSearchQuery(searchParams: SearchProductsQuery): Promise<Record<string, any>> {
        const { search, category, subcategory, brand, price } = searchParams;
        const query = await this.buildCommonQuerySegment({ category, subcategory, brand });

        if (search) query.name = { $regex: escapeRegex(search), $options: 'i' };

        if (price) {
            const [min, max] = price.split(',').map(Number);
            query.price = {};
            if (!isNaN(min)) query.price.$gte = min;
            if (!isNaN(max)) query.price.$lte = max;
        }

        return query;
    }

    /**
     * Validate that referenced entities exist
     */
    static async validateEntities(categoryIds: string[], subcategoryIds: string[], brandId: string) {
        const [categoriesExist, subcategoriesExist, brandExists] = await Promise.all([
            Category.countDocuments({ _id: { $in: categoryIds } }),
            Subcategory.countDocuments({ _id: { $in: subcategoryIds } }),
            Brand.findById(brandId)
        ]);

        if (categoriesExist !== categoryIds.length) throw new ApiError(400, "One or more categories not found");
        if (subcategoriesExist !== subcategoryIds.length) throw new ApiError(400, "One or more subcategories not found");
        if (!brandExists) throw new ApiError(400, "Brand not found");
    }
}