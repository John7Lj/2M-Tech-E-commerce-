import { Request, Response, NextFunction } from 'express';
import stripe from "../../../config/stripe.config";
import { asyncHandler } from "../../../utils/asyncHandler";
import { ApiError } from "../../../utils/ApiError";

export const createPaymentIntent = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { amount } = req.body;

    if (!amount) {
        return next(new ApiError(400, "Please enter amount"));
    }

    const paymentIntent = await stripe.paymentIntents.create({
        amount: Number(amount) * 100, // Stripe expects amount in cents
        currency: "usd", // Set your preferred currency here or get from currency config
        metadata: {
            integration_check: "accept_a_payment",
        },
    });

    res.status(201).json({
        success: true,
        client_secret: paymentIntent.client_secret,
    });
});
