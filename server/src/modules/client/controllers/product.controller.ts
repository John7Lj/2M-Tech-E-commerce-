import { Request, Response } from "express";
import { Product } from "../../../models/product.model";
import { Category } from "../../../models/category.model";
import { Subcategory } from "../../../models/subcategory.model";
import { Brand } from "../../../models/brand.model";
import { SearchProductsQuery } from "../../../types/types";
import { ApiError } from "../../../utils/ApiError";
import { asyncHandler } from "../../../utils/asyncHandler";
import { ProductService } from "../../../services/product.service";
import mongoose from "mongoose";

export const getLatestProducts = asyncHandler(
    async (req: Request, res: Response) => {
        const limit = Math.min(Number(req.query.limit) || 20, 100);
        const includeUnpublished = req.query.includeUnpublished === 'true';

        const products = await Product.find(includeUnpublished ? {} : { status: true })
            .populate(ProductService.productPopulate)
            .sort({ createdAt: -1 })
            .limit(limit);

        return res.status(200).json({
            success: true,
            products,
            totalReturned: products.length
        });
    }
);

export const getAllCategories = asyncHandler(
    async (req: Request, res: Response) => {
        const [categories, subcategories] = await Promise.all([
            Category.find({ isActive: true }).select('name value'),
            Subcategory.find({ isActive: true }).populate('parentCategory', 'name _id').select('name value parentCategory')
        ]);

        return res.status(200).json({
            success: true,
            categories,
            subcategories
        });
    }
);

export const getAllProducts = asyncHandler(
    async (req: Request, res: Response) => {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const { category, subcategory, brand } = req.query;
        const includeUnpublished = req.query.includeUnpublished === 'true';

        const sortBy = req.query.sortBy ? JSON.parse(req.query.sortBy as string) : null;
        const sort = ProductService.buildSortQuery(sortBy);
        const query = await ProductService.buildFilterQuery({
            category: category as string,
            subcategory: subcategory as string,
            brand: brand as string
        });

        if (!includeUnpublished) query.status = true;

        const [totalProducts, products] = await Promise.all([
            Product.countDocuments(query),
            Product.find(query)
                .populate(ProductService.productPopulate)
                .sort(sort)
                .skip(skip)
                .limit(limit)
        ]);

        return res.status(200).json({
            success: true,
            products,
            totalProducts,
            totalPages: Math.ceil(totalProducts / limit),
            currentPage: page
        });
    }
);

export const getProductDetails = asyncHandler(
    async (req: Request, res: Response, next) => {
        const product = await Product.findById(req.params.id)
            .populate(ProductService.productPopulate);

        if (!product) {
            return next(new ApiError(404, "Product not found"));
        }

        return res.status(200).json({
            success: true,
            product
        });
    }
);

export const searchProducts = asyncHandler(
    async (req: Request<{}, {}, {}, SearchProductsQuery>, res: Response) => {
        const page = Number(req.query.page) || 1;
        const limit = Number(process.env.PRODUCTS_PER_PAGE) || 20;
        const skip = (page - 1) * limit;
        const includeUnpublished = req.query.includeUnpublished === 'true';

        const query = await ProductService.buildSearchQuery(req.query);
        if (!includeUnpublished) query.status = true;

        const sort = ProductService.buildSortQuery({
            id: req.query.sort === 'asc' || req.query.sort === 'desc' ? 'price' : '',
            desc: req.query.sort === 'desc'
        });

        const [products, totalProducts] = await Promise.all([
            Product.find(query)
                .populate(ProductService.productPopulate)
                .sort(sort)
                .skip(skip)
                .limit(limit),
            Product.countDocuments(query)
        ]);

        return res.status(200).json({
            success: true,
            products,
            totalPage: Math.ceil(totalProducts / limit),
            totalProducts
        });
    }
);

export const getFeaturedProducts = asyncHandler(
    async (req: Request, res: Response) => {
        const includeUnpublished = req.query.includeUnpublished === 'true';

        const query = includeUnpublished
            ? { featured: true }
            : { featured: true, status: true };

        const products = await Product.find(query)
            .populate(ProductService.productPopulate);

        return res.status(200).json({
            success: true,
            products
        });
    }
);

export const getProductsByCategory = asyncHandler(
    async (req: Request, res: Response, next) => {
        const { categoryId } = req.params;
        const limit = Math.min(Number(req.query.limit) || 20, 500);
        const includeUnpublished = req.query.includeUnpublished === 'true';

        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return next(new ApiError(400, "Invalid category ID"));
        }

        const category = await Category.findById(categoryId);
        if (!category) {
            return next(new ApiError(404, "Category not found"));
        }

        const query = includeUnpublished
            ? { categories: categoryId }
            : { categories: categoryId, status: true };

        const products = await Product.find(query)
            .populate('categories', 'name _id')
            .populate('subcategories', 'name _id')
            .populate('brand', 'name _id')
            .sort({ createdAt: -1 })
            .limit(limit);

        return res.status(200).json({
            success: true,
            products,
            category: category.name,
            totalReturned: products.length
        });
    }
);

export const getProductsBySubcategory = asyncHandler(
    async (req: Request, res: Response, next) => {
        const { subcategoryId } = req.params;
        const limit = Math.min(Number(req.query.limit) || 20, 500);
        const includeUnpublished = req.query.includeUnpublished === 'true';

        if (!mongoose.Types.ObjectId.isValid(subcategoryId)) {
            return next(new ApiError(400, "Invalid subcategory ID"));
        }

        const subcategory = await Subcategory.findById(subcategoryId).populate('parentCategory', 'name');
        if (!subcategory) {
            return next(new ApiError(404, "Subcategory not found"));
        }

        const query = includeUnpublished
            ? { subcategories: subcategoryId }
            : { subcategories: subcategoryId, status: true };

        const products = await Product.find(query)
            .populate('categories', 'name _id')
            .populate('subcategories', 'name _id')
            .populate('brand', 'name _id')
            .sort({ createdAt: -1 })
            .limit(limit);

        return res.status(200).json({
            success: true,
            products,
            subcategory: subcategory.name,
            parentCategory: subcategory.parentCategory,
            totalReturned: products.length
        });
    }
);

export const getProductsByBrand = asyncHandler(
    async (req: Request, res: Response, next) => {
        const { brandId } = req.params;
        const limit = Math.min(Number(req.query.limit) || 20, 500);
        const includeUnpublished = req.query.includeUnpublished === 'true';

        if (!mongoose.Types.ObjectId.isValid(brandId)) {
            return next(new ApiError(400, "Invalid brand ID"));
        }

        const brand = await Brand.findById(brandId);
        if (!brand) {
            return next(new ApiError(404, "Brand not found"));
        }

        const query = includeUnpublished
            ? { brand: brandId }
            : { brand: brandId, status: true };

        const products = await Product.find(query)
            .populate('categories', 'name _id')
            .populate('subcategories', 'name _id')
            .populate('brand', 'name _id')
            .sort({ createdAt: -1 })
            .limit(limit);

        return res.status(200).json({
            success: true,
            products,
            brand: brand.name,
            totalReturned: products.length
        });
    }
);
