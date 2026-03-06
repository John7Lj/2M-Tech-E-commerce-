import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import Order from "../../../models/order.model";
import { NewOrderRequestBody, RequestWithUser } from "../../../types/types";
import { ApiError } from "../../../utils/ApiError";
import { reduceStock } from "../../../utils/utils";
import { telegramService } from "../../../services/telegram.service";
import { IUser } from "../../../models/user.model";
import { Product } from "../../../models/product.model";
import Coupon from "../../../models/coupon.model";
import { CouponService } from "../../../services/coupon.service";

// Create New Order
export const newOrder = asyncHandler(async (req: Request<{}, {}, NewOrderRequestBody>, res: Response, next: NextFunction) => {
    const { orderItems, shippingInfo, discount, shippingCharges, subTotal, tax, total, couponCode } = req.body;

    if (!orderItems?.length || !shippingInfo?.address || !shippingInfo?.city || !shippingInfo?.country || !shippingInfo?.phone) {
        return next(new ApiError(400, 'All order and shipping details are required'));
    }

    const phoneRegex = /^\+?[\d\s\-()]{7,15}$/;
    if (!phoneRegex.test(shippingInfo.phone.trim())) {
        return next(new ApiError(400, 'Invalid phone number format'));
    }

    const user = (req as RequestWithUser).user as IUser;
    if (!user?._id) return next(new ApiError(401, 'Authentication required'));

    // 1. Bulk calculate and validate
    const products = await Product.find({ _id: { $in: orderItems.map(i => i.productId) } });
    const productMap = new Map(products.map(p => [p._id.toString(), p]));

    let computedSubTotal = 0;
    for (const item of orderItems) {
        const product = productMap.get(item.productId.toString());
        if (!product || !product.status || product.stock < item.quantity) {
            return next(new ApiError(400, `Insufficient stock or product not found: ${item.name || item.productId}`));
        }
        computedSubTotal += product.netPrice * item.quantity;
    }

    // 2. Validate Coupon
    let computedDiscount = 0;
    let couponId = null;
    if (couponCode) {
        const coupon = await CouponService.validateCoupon(couponCode, computedSubTotal);
        if (coupon) {
            computedDiscount = Math.min(coupon.amount, computedSubTotal);
            couponId = coupon._id;
        }
    }

    const computedTotal = Math.round((computedSubTotal + shippingCharges + tax - computedDiscount) * 100) / 100;
    if (Math.abs(computedTotal - Number(total)) > 1) {
        return next(new ApiError(400, 'Price mismatch. Please refresh your cart.'));
    }

    // 3. Create Order
    const order = await Order.create({
        orderItems, shippingInfo, discount: computedDiscount,
        shippingCharges, subtotal: Math.round(computedSubTotal * 100) / 100,
        tax, total: computedTotal, user: user._id
    });

    try {
        await reduceStock(orderItems);
        if (couponId) await CouponService.useCoupon(couponId.toString());
    } catch (err: any) {
        await order.deleteOne();
        return next(new ApiError(400, err.message || 'Stock update failed'));
    }

    if (telegramService.isConfigured()) {
        telegramService.sendOrderNotification({
            orderId: order._id.toString(), orderItems, shippingInfo,
            total: computedTotal, subtotal: computedSubTotal,
            tax, shippingCharges, discount: computedDiscount,
            customerEmail: user.email, customerName: user.name,
        }).catch(err => console.error('Telegram error:', err.message));
    }

    return res.status(201).json({ success: true, message: 'Order placed successfully', orderId: order._id });
});

export const getUserOrders = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as RequestWithUser).user;
    const orders = await Order.find({ user: user._id });

    return res.status(200).json({
        success: true,
        orders
    });
});

export const getOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const orderId = req.params.id;
    const order = await Order.findById(orderId).populate('user', 'name email');

    if (!order) return next(new ApiError(404, 'Order not found'));

    const reqUser = (req as RequestWithUser).user;
    const orderUserId = typeof order.user === 'object' && order.user !== null
        ? (order.user as any)._id?.toString()
        : order.user?.toString();
    if (reqUser.role !== 'admin' && orderUserId !== reqUser._id.toString()) {
        return next(new ApiError(403, 'Not authorized to view this order'));
    }

    return res.status(200).json({
        success: true,
        order
    });
});
