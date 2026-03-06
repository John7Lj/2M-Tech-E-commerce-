import { Request, Response } from 'express';
import Settings from '../../../models/settings.model';
export { getSettings } from "../../client/controllers/settings.controller";
import { asyncHandler } from '../../../utils/asyncHandler';
import { ApiError } from '../../../utils/ApiError';

export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
    const {
        companyName,
        phone,
        email,
        address,
        website,
        description,
        metaTitle,
        metaDescription,
        metaKeywords,
        facebook,
        instagram,
        twitter,
        linkedin,
        whatsapp,
        timezone,
        language,
    } = req.body;

    let settings = await Settings.findOne();

    if (!settings) {
        settings = new Settings();
    }

    let logoUrl = settings.logo;
    if (req.file) {
        try {
            logoUrl = (req.file as any).path;
        } catch (error) {
            throw new ApiError(400, 'Failed to upload logo image');
        }
    }

    settings.companyName = companyName !== undefined ? companyName : settings.companyName;
    settings.logo = logoUrl;
    settings.phone = phone !== undefined ? phone : settings.phone;
    settings.email = email !== undefined ? email : settings.email;
    settings.address = address !== undefined ? address : settings.address;
    settings.website = website !== undefined ? website : settings.website;
    settings.description = description !== undefined ? description : settings.description;
    settings.metaTitle = metaTitle !== undefined ? metaTitle : settings.metaTitle;
    settings.metaDescription = metaDescription !== undefined ? metaDescription : settings.metaDescription;
    settings.metaKeywords = metaKeywords !== undefined ? metaKeywords : settings.metaKeywords;
    settings.facebook = facebook !== undefined ? facebook : settings.facebook;
    settings.instagram = instagram !== undefined ? instagram : settings.instagram;
    settings.twitter = twitter !== undefined ? twitter : settings.twitter;
    settings.linkedin = linkedin !== undefined ? linkedin : settings.linkedin;
    settings.whatsapp = whatsapp !== undefined ? whatsapp : settings.whatsapp;
    settings.timezone = timezone !== undefined ? timezone : settings.timezone;
    settings.language = language !== undefined ? language : settings.language;


    await settings.save();

    res.status(200).json({
        success: true,
        message: 'Settings updated successfully',
        settings
    });
});

export const clearSettings = asyncHandler(async (req: Request, res: Response) => {
    await Settings.deleteMany({});
    res.status(200).json({
        success: true,
        message: 'Settings cleared successfully'
    });
});
