import { Request, Response } from 'express';
import Settings from '../../../models/settings.model';
import { asyncHandler } from '../../../utils/asyncHandler';

export const getSettings = asyncHandler(async (req: Request, res: Response) => {
    let settings = await Settings.findOne();

    if (!settings) {
        settings = await Settings.create({});
    }

    res.status(200).json({
        success: true,
        settings
    });
});
