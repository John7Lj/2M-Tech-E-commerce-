import { Request, Response } from "express";
import { Banner } from "../../../models/banner.model";
import { ApiError } from "../../../utils/ApiError";
import { asyncHandler } from "../../../utils/asyncHandler";

export const getAllBanners = asyncHandler(
    async (req: Request, res: Response) => {
        const includeInactive = req.query.includeInactive === 'true';
        const query = includeInactive ? {} : { isActive: true };

        const banners = await Banner.find(query)
            .populate({
                path: 'products.product',
                select: 'name price netPrice discount photos brand categories stock status',
                populate: { path: 'brand categories', select: 'name' }
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, banners });
    }
);

export const getBannerById = asyncHandler(
    async (req: Request, res: Response, next) => {
        const banner = await Banner.findById(req.params.id).populate({
            path: 'products.product',
            select: 'name price netPrice discount photos brand categories stock status',
            populate: { path: 'brand categories', select: 'name' }
        });

        if (!banner) {
            return next(new ApiError(404, "Banner not found"));
        }

        return res.status(200).json({ success: true, banner });
    }
);
