import { Request, Response, NextFunction } from 'express';
import { Page } from '../../../models/page.model';
import { asyncHandler } from '../../../utils/asyncHandler';
import { ApiError } from '../../../utils/ApiError';

export const getAllPages = asyncHandler(async (req: Request, res: Response) => {
    const pages = await Page.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, pages });
});

export const createPage = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { title, slug, content, isPublished } = req.body;

    if (!title || !slug || !content) {
        return next(new ApiError(400, 'Title, slug, and content are required'));
    }

    const existingPage = await Page.findOne({ slug: slug.trim() });
    if (existingPage) {
        return next(new ApiError(409, 'A page with this slug already exists'));
    }

    const page = await Page.create({
        title: title.trim(),
        slug: slug.trim(),
        content,
        isPublished: isPublished !== undefined ? isPublished : true
    });

    res.status(201).json({ success: true, page });
});

export const updatePage = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { title, slug, content, isPublished } = req.body;

    const updateData: Record<string, any> = {};
    if (title !== undefined) updateData.title = title.trim();
    if (slug !== undefined) updateData.slug = slug.trim();
    if (content !== undefined) updateData.content = content;
    if (isPublished !== undefined) updateData.isPublished = isPublished;

    if (slug) {
        const existingPage = await Page.findOne({
            slug: slug.trim(),
            _id: { $ne: req.params.id }
        });
        if (existingPage) {
            return next(new ApiError(409, 'A page with this slug already exists'));
        }
    }

    const page = await Page.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
    );

    if (!page) {
        return next(new ApiError(404, 'Page not found'));
    }

    res.status(200).json({ success: true, page });
});

export const deletePage = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const page = await Page.findByIdAndDelete(req.params.id);

    if (!page) {
        return next(new ApiError(404, 'Page not found'));
    }

    res.status(200).json({ success: true, message: 'Page deleted successfully' });
});
