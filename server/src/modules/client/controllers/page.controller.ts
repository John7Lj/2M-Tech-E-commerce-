import { Request, Response, NextFunction } from 'express';
import { Page } from '../../../models/page.model';
import { asyncHandler } from '../../../utils/asyncHandler';
import { ApiError } from '../../../utils/ApiError';

export const getPageBySlug = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const requestedSlug = req.params.slug;

    const page = await Page.findOne({
        slug: requestedSlug,
        isPublished: true
    });

    if (!page) {
        return next(new ApiError(404, 'Page not found'));
    }

    res.status(200).json({ success: true, page });
});
