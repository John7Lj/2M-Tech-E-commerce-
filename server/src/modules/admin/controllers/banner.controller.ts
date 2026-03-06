import { Request, Response } from "express";
import { Banner } from "../../../models/banner.model";
import { Product } from "../../../models/product.model";
import { ApiError } from "../../../utils/ApiError";
import { asyncHandler } from "../../../utils/asyncHandler";
import { deleteImage, extractPublicId } from "../../../utils/cloudinary";
import mongoose from "mongoose";
export { getAllBanners } from "../../client/controllers/banner.controller";
export { getBannerById } from "../../client/controllers/banner.controller";

// ─── Shared helpers ──────────────────────────────────────────────────────────

const applyBannerDiscounts = async (bannerProducts: any[]) => {
    for (const bp of bannerProducts) {
        const product = await Product.findById(bp.product);
        if (!product) continue;
        if (bp.originalDiscount === undefined || bp.originalDiscount === null) {
            bp.originalDiscount = product.discount;
        }
        product.discount = bp.discountPercentage;
        product.netPrice = product.price - (product.price * bp.discountPercentage) / 100;
        await product.save();
    }
};

const restoreBannerDiscounts = async (bannerProducts: any[]) => {
    for (const bp of bannerProducts) {
        const product = await Product.findById(bp.product);
        if (!product) continue;
        const originalDiscount = bp.originalDiscount ?? 0;
        product.discount = originalDiscount;
        product.netPrice = product.price - (product.price * originalDiscount) / 100;
        await product.save();
    }
};

// ─── Controllers ─────────────────────────────────────────────────────────────

export const createBanner = asyncHandler(
    async (req: Request, res: Response, next) => {
        const { name, description, products, isActive } = req.body;

        if (!name || !description) {
            return next(new ApiError(400, "Name and description are required"));
        }

        if (!req.file || !req.file.path || !req.file.filename) {
            return next(new ApiError(400, "Banner image is required"));
        }

        const bannerProducts = products ? JSON.parse(products) : [];

        for (const product of bannerProducts) {
            if (!mongoose.Types.ObjectId.isValid(product.product)) {
                return next(new ApiError(400, "Invalid product ID"));
            }
            const productExists = await Product.findById(product.product);
            if (!productExists) {
                return next(new ApiError(400, `Product not found: ${product.product}`));
            }
            if (product.discountPercentage < 0 || product.discountPercentage > 100) {
                return next(new ApiError(400, "Discount percentage must be between 0 and 100"));
            }
        }

        try {
            const shouldActivate = isActive === 'true' || isActive === true;

            const enrichedProducts = await Promise.all(
                bannerProducts.map(async (bp: any) => {
                    const product = await Product.findById(bp.product);
                    return { ...bp, originalDiscount: product?.discount ?? 0 };
                })
            );

            const banner = await Banner.create({
                name: name.trim(),
                description: description.trim(),
                image: req.file.path,
                imagePublicId: req.file.filename,
                products: enrichedProducts,
                isActive: shouldActivate
            });

            if (shouldActivate && enrichedProducts.length > 0) {
                await applyBannerDiscounts(enrichedProducts);
            }

            const populatedBanner = await Banner.findById(banner._id).populate({
                path: 'products.product',
                select: 'name price netPrice discount photos brand categories stock status',
                populate: { path: 'brand categories', select: 'name' }
            });

            return res.status(201).json({
                success: true,
                message: "Banner created successfully",
                banner: populatedBanner
            });
        } catch (error) {
            if (req.file?.filename) {
                await deleteImage(req.file.filename).catch(console.error);
            }
            return next(new ApiError(500, "Failed to create banner"));
        }
    }
);

export const updateBanner = asyncHandler(
    async (req: Request, res: Response, next) => {
        const { id } = req.params;
        const { name, description, products, isActive } = req.body;

        const banner = await Banner.findById(id);
        if (!banner) {
            return next(new ApiError(404, "Banner not found"));
        }

        if (banner.isActive && banner.products.length > 0) {
            await restoreBannerDiscounts(banner.products);
        }

        if (req.file && req.file.path && req.file.filename) {
            const oldImagePublicId = banner.imagePublicId;
            banner.image = req.file.path;
            banner.imagePublicId = req.file.filename;
            if (oldImagePublicId) {
                deleteImage(oldImagePublicId).catch(console.error);
            }
        }

        let newProducts = banner.products;
        if (products) {
            const parsed = JSON.parse(products);

            for (const product of parsed) {
                if (!mongoose.Types.ObjectId.isValid(product.product)) {
                    return next(new ApiError(400, "Invalid product ID"));
                }
                const productExists = await Product.findById(product.product);
                if (!productExists) {
                    return next(new ApiError(400, `Product not found: ${product.product}`));
                }
                if (product.discountPercentage < 0 || product.discountPercentage > 100) {
                    return next(new ApiError(400, "Discount percentage must be between 0 and 100"));
                }
            }

            newProducts = await Promise.all(
                parsed.map(async (bp: any) => {
                    const product = await Product.findById(bp.product);
                    return { ...bp, originalDiscount: product?.discount ?? 0 };
                })
            );
        }

        if (name) banner.name = name.trim();
        if (description) banner.description = description.trim();
        banner.products = newProducts;

        const newIsActive = isActive === 'true' || isActive === true;
        banner.isActive = newIsActive;
        await banner.save();

        if (newIsActive && newProducts.length > 0) {
            await applyBannerDiscounts(newProducts);
        }

        const populatedBanner = await Banner.findById(banner._id).populate({
            path: 'products.product',
            select: 'name price netPrice discount photos brand categories stock status',
            populate: { path: 'brand categories', select: 'name' }
        });

        return res.status(200).json({
            success: true,
            message: "Banner updated successfully",
            banner: populatedBanner
        });
    }
);

export const deleteBanner = asyncHandler(
    async (req: Request, res: Response, next) => {
        const banner = await Banner.findById(req.params.id);
        if (!banner) {
            return next(new ApiError(404, "Banner not found"));
        }

        if (banner.isActive && banner.products.length > 0) {
            await restoreBannerDiscounts(banner.products);
        }

        if (banner.imagePublicId) {
            deleteImage(banner.imagePublicId).catch(console.error);
        }

        await banner.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Banner deleted successfully"
        });
    }
);

export const toggleBannerStatus = asyncHandler(
    async (req: Request, res: Response, next) => {
        const banner = await Banner.findById(req.params.id);
        if (!banner) {
            return next(new ApiError(404, "Banner not found"));
        }

        const wasActive = banner.isActive;
        banner.isActive = !banner.isActive;
        await banner.save();

        if (!wasActive && banner.isActive && banner.products.length > 0) {
            await applyBannerDiscounts(banner.products);
        } else if (wasActive && !banner.isActive && banner.products.length > 0) {
            await restoreBannerDiscounts(banner.products);
        }

        const populatedBanner = await Banner.findById(banner._id).populate({
            path: 'products.product',
            select: 'name price netPrice discount photos brand categories stock status',
            populate: { path: 'brand categories', select: 'name' }
        });

        return res.status(200).json({
            success: true,
            message: `Banner ${banner.isActive ? 'activated' : 'deactivated'} successfully`,
            banner: populatedBanner
        });
    }
);
