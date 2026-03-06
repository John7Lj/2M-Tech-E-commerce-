import { Request, Response } from "express";
import { Currency } from "../../../models/currency.model";
import { asyncHandler } from "../../../utils/asyncHandler";

export const getAllCurrencies = asyncHandler(
    async (req: Request, res: Response) => {
        const currencies = await Currency.find().sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            currencies
        });
    }
);

export const getDefaultCurrency = asyncHandler(
    async (req: Request, res: Response) => {
        const defaultCurrency = await Currency.findOne({ isDefault: true });

        return res.status(200).json({
            success: true,
            currency: defaultCurrency
        });
    }
);
