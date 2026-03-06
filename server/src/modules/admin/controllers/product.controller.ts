import { Request, Response } from "express";
import { Product } from "../../../models/product.model";
import { Category } from "../../../models/category.model";
import { Subcategory } from "../../../models/subcategory.model";
import { Brand } from "../../../models/brand.model";
import { NewProductBody } from "../../../types/types";
import { ApiError } from "../../../utils/ApiError";
import { asyncHandler } from "../../../utils/asyncHandler";
import { Banner } from "../../../models/banner.model";
import { deleteMultipleImages } from "../../../utils/cloudinary";
import { ProductService } from "../../../services/product.service";
import mongoose from "mongoose";
import { getDefaultCurrencySymbol } from "../../../utils/helper";
export {
    getAllProducts,
    getProductDetails,
    getLatestProducts,
    searchProducts,
    getProductsByCategory,
    getProductsByBrand,
    getProductsBySubcategory
} from "../../client/controllers/product.controller";

// Sync product discount change back into banners that reference the product.
const syncProductDiscountToBanners = async (productId: string, newDiscount: number) => {
    try {
        const bannersWithProduct = await Banner.find({
            'products.product': productId,
            isActive: true
        });

        for (const banner of bannersWithProduct) {
            let updated = false;
            banner.products = banner.products.map(bannerProduct => {
                if (bannerProduct.product.toString() === productId) {
                    bannerProduct.originalDiscount = newDiscount;
                    updated = true;
                }
                return bannerProduct;
            });
            if (updated) {
                await banner.save();
            }
        }
    } catch (error) {
        console.error('Error syncing product discount to banners:', error);
    }
};

export const createNewProduct = asyncHandler(
    async (req: Request<{}, {}, NewProductBody>, res: Response, next) => {
        const { name, categories, subcategories, brand, price, discount = 0, stock, description, status = true, featured = false } = req.body;

        if (!name || !categories || !brand || !price || !stock || !description) {
            return next(new ApiError(400, "Please fill all required fields"));
        }

        if (discount < 0 || discount > 100) {
            return next(new ApiError(400, "Discount must be between 0 and 100"));
        }

        const categoryIds = Array.isArray(categories) ? categories : JSON.parse(categories);
        const subcategoryIds = subcategories ? (Array.isArray(subcategories) ? subcategories : JSON.parse(subcategories)) : [];

        await ProductService.validateEntities(categoryIds, subcategoryIds, brand);

        const currencySymbol = await getDefaultCurrencySymbol();
        const photoData = await ProductService.processUploadedFiles(req.files as Express.Multer.File[]);

        const priceValue = Number(price);
        const discountValue = Number(discount);
        const stockValue = Number(stock);
        const netPrice = priceValue - ((priceValue * discountValue) / 100);

        try {
            const product = await Product.create({
                name: name.trim(),
                categories: categoryIds.map(id => new mongoose.Types.ObjectId(id)),
                subcategories: subcategoryIds.map(id => new mongoose.Types.ObjectId(id)),
                brand: new mongoose.Types.ObjectId(brand),
                description: description.trim(),
                price: priceValue,
                discount: discountValue,
                netPrice: netPrice,
                stock: stockValue,
                photos: photoData.photos,
                photoPublicIds: photoData.photoPublicIds,
                currencySymbol,
                status: typeof status === 'string' ? status === 'true' : Boolean(status),
                featured: typeof featured === 'string' ? featured === 'true' : Boolean(featured)
            });

            const populatedProduct = await Product.findById(product._id)
                .populate(ProductService.productPopulate);

            return res.status(201).json({
                success: true,
                message: "Product created successfully",
                product: populatedProduct
            });
        } catch (error) {
            if (photoData.photoPublicIds.length > 0) {
                await deleteMultipleImages(photoData.photoPublicIds).catch(console.error);
            }
            return next(new ApiError(500, "Failed to create product"));
        }
    }
);

export const updateProduct = asyncHandler(
    async (req: Request, res: Response, next) => {
        const id = req.params.id;
        const { name, categories, subcategories, brand, price, discount, stock, description, status, featured } = req.body;

        const product = await Product.findById(id);
        if (!product) {
            return next(new ApiError(404, "Product not found"));
        }

        const oldDiscount = product.discount;

        if (categories || subcategories !== undefined || brand) {
            const newCatIds = categories ? (Array.isArray(categories) ? categories : JSON.parse(categories)) : product.categories;
            const newSubIds = subcategories !== undefined ?
                (subcategories ? (Array.isArray(subcategories) ? subcategories : JSON.parse(subcategories)) : []) :
                product.subcategories;
            const newBrandId = brand || product.brand;

            await ProductService.validateEntities(newCatIds as string[], newSubIds as string[], newBrandId.toString());

            if (categories) product.categories = newCatIds.map((id: string) => new mongoose.Types.ObjectId(id));
            if (subcategories !== undefined) product.subcategories = newSubIds.map((id: string) => new mongoose.Types.ObjectId(id));
            if (brand) product.brand = new mongoose.Types.ObjectId(brand);
        }

        if (req.files && (req.files as Express.Multer.File[]).length > 0) {
            const photoData = await ProductService.processUploadedFiles(req.files as Express.Multer.File[]);
            const oldPhotoPublicIds = product.photoPublicIds || [];
            product.photos = photoData.photos;
            product.photoPublicIds = photoData.photoPublicIds;
            if (oldPhotoPublicIds.length > 0) deleteMultipleImages(oldPhotoPublicIds).catch(console.error);
        }

        if (name !== undefined) product.name = name.trim();
        if (price !== undefined) product.price = Number(price);
        if (stock !== undefined) product.stock = Number(stock);
        if (description !== undefined) product.description = description.trim();
        if (status !== undefined) product.status = status === 'true' || status === true;
        if (featured !== undefined) product.featured = featured === 'true' || featured === true;

        product.netPrice = product.price - ((product.price * product.discount) / 100);
        const updatedProduct = await product.save();

        if (discount !== undefined && Number(discount) !== oldDiscount) {
            await syncProductDiscountToBanners(id, Number(discount));
        }

        const populatedProduct = await Product.findById(updatedProduct._id)
            .populate(ProductService.productPopulate);

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: populatedProduct
        });
    }
);

export const deleteProduct = asyncHandler(
    async (req: Request, res: Response, next) => {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return next(new ApiError(404, "Product not found"));
        }

        if (product.photoPublicIds && product.photoPublicIds.length > 0) {
            await deleteMultipleImages(product.photoPublicIds);
        }

        await product.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });
    }
);

export const toggleFeaturedStatus = asyncHandler(
    async (req: Request, res: Response, next) => {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return next(new ApiError(404, "Product not found"));
        }

        product.featured = !product.featured;
        await product.save();

        const populatedProduct = await Product.findById(product._id)
            .populate(ProductService.productPopulate);

        return res.status(200).json({
            success: true,
            message: "Product featured status updated successfully",
            product: populatedProduct
        });
    }
);

export const togglePublishedStatus = asyncHandler(
    async (req: Request, res: Response, next) => {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return next(new ApiError(404, "Product not found"));
        }

        product.status = !product.status;
        await product.save();

        const populatedProduct = await Product.findById(product._id)
            .populate(ProductService.productPopulate);

        return res.status(200).json({
            success: true,
            message: `Product ${product.status ? 'published' : 'unpublished'} successfully`,
            product: populatedProduct
        });
    }
);
