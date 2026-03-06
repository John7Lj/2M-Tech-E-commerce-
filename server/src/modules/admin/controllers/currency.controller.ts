import { NextFunction, Request, Response } from 'express';
import { Currency } from "../../../models/currency.model";
export { getAllCurrencies, getDefaultCurrency } from "../../client/controllers/currency.controller";
import { Product } from "../../../models/product.model";
import { ApiError } from "../../../utils/ApiError";
import { asyncHandler } from "../../../utils/asyncHandler";

export const createCurrency = asyncHandler(
    async (req: Request, res: Response, next) => {
        const { symbol } = req.body;

        if (!symbol) {
            return next(new ApiError(400, "Currency symbol is required"));
        }

        const existingCurrency = await Currency.findOne({ symbol: symbol.trim() });
        if (existingCurrency) {
            return next(new ApiError(400, "Currency symbol already exists"));
        }

        const currency = await Currency.create({
            symbol: symbol.trim()
        });

        return res.status(201).json({
            success: true,
            message: "Currency created successfully",
            currency
        });
    }
);

export const setDefaultCurrency = asyncHandler(
    async (req: Request, res: Response, next) => {
        const { currencyId } = req.params;

        const currency = await Currency.findById(currencyId);
        if (!currency) {
            return next(new ApiError(404, "Currency not found"));
        }

        await Currency.updateMany({}, { isDefault: false });

        currency.isDefault = true;
        await currency.save();

        await Product.updateMany(
            {},
            { currencySymbol: currency.symbol }
        );

        return res.status(200).json({
            success: true,
            message: "Default currency updated successfully",
            currency
        });
    }
);

export const deleteCurrency = asyncHandler(
    async (req: Request, res: Response, next) => {
        const { currencyId } = req.params;

        const currency = await Currency.findById(currencyId);
        if (!currency) {
            return next(new ApiError(404, "Currency not found"));
        }

        if (currency.isDefault) {
            return next(new ApiError(400, "Cannot delete default currency"));
        }

        await currency.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Currency deleted successfully"
        });
    }
);
