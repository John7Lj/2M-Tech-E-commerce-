import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import Order from "../../../models/order.model";
import { ApiError } from "../../../utils/ApiError";
import { increaseStock } from "../../../utils/utils";
import { telegramService } from "../../../services/telegram.service";
import { IUser } from "../../../models/user.model";

export { getOrder } from "../../client/controllers/order.controller";

const ORDER_STATUSES = ["Pending", "Processing", "Shipped", "Delivered"];

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const orderId = req.params.id;
    const { status } = req.body;

    if (!status) {
        return next(new ApiError(400, 'Status is required'));
    }

    if (!ORDER_STATUSES.includes(status)) {
        return next(new ApiError(400, `Invalid status. Must be one of: ${ORDER_STATUSES.join(', ')}`));
    }

    const order = await Order.findById(orderId).populate('user');
    if (!order) {
        return next(new ApiError(404, 'Order not found'));
    }

    const currentIndex = ORDER_STATUSES.indexOf(order.status);
    const newIndex = ORDER_STATUSES.indexOf(status);
    if (newIndex < currentIndex) {
        return next(new ApiError(400, `Cannot change status from "${order.status}" back to "${status}"`));
    }

    const oldStatus = order.status;
    order.status = status;
    await order.save();

    try {
        if (telegramService.isConfigured()) {
            const orderUser = order.user as unknown as IUser;
            await telegramService.sendOrderStatusUpdate(
                orderId,
                status,
                orderUser?.name || orderUser?.email || 'Unknown Customer'
            );
        }
    } catch (telegramError: any) {
        console.error('Telegram status update error:', telegramError.message);
    }

    res.status(200).json({
        success: true,
        message: `Order status updated from ${oldStatus} to ${status}`
    });
});

export const deleteOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const orderId = req.params.id;

    const order = await Order.findById(orderId);
    if (!order) return next(new ApiError(404, 'Order not found'));

    if (order.status !== 'Delivered') {
        await increaseStock(order.orderItems as any);
    }

    await order.deleteOne();

    return res.status(200).json({
        success: true,
        message: 'Order deleted successfully'
    });
});

export const getAllOrders = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const orders = await Order.find().populate('user', 'name email');

    return res.status(200).json({
        success: true,
        orders
    });
});
