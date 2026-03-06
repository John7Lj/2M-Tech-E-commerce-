import { Request, Response, NextFunction } from 'express';
import Order from '../../../models/order.model';
import User from '../../../models/user.model';
import { Product } from '../../../models/product.model';
import Coupon from '../../../models/coupon.model';
import { asyncHandler } from '../../../utils/asyncHandler';

export const getStats = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const [
        revenueAgg,
        revenueByMonthAgg,
        revenueByDayAgg,
        bestSellingAgg,
        totalOrders,
        latestOrders,
        userGenderDemographic,
        totalProducts,
        totalCoupons
    ] = await Promise.all([
        Order.aggregate([
            { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
        ]),
        Order.aggregate([
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    revenue: { $sum: '$total' }
                }
            },
            { $sort: { _id: 1 } }
        ]),
        Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    revenue: { $sum: '$total' }
                }
            },
            { $sort: { _id: 1 } }
        ]),
        Order.aggregate([
            { $unwind: '$orderItems' },
            {
                $group: {
                    _id: '$orderItems.productId',
                    name: { $first: '$orderItems.name' },
                    quantity: { $sum: '$orderItems.quantity' }
                }
            },
            { $sort: { quantity: -1 } },
            { $limit: 5 },
            {
                $project: {
                    productId: '$_id',
                    name: 1,
                    quantity: 1,
                    _id: 0
                }
            }
        ]),
        Order.countDocuments(),
        Order.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(5)
            .lean(),
        User.aggregate([
            { $group: { _id: '$gender', count: { $sum: 1 } } }
        ]),
        Product.countDocuments(),
        Coupon.countDocuments()
    ]);

    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    const revenueByMonth: Record<number, number> = {};
    revenueByMonthAgg.forEach((item: any) => {
        revenueByMonth[item._id - 1] = item.revenue;
    });

    const revenueByDay: Record<string, number> = {};
    revenueByDayAgg.forEach((item: any) => {
        revenueByDay[item._id] = item.revenue;
    });

    res.json({
        success: true,
        stats: {
            totalRevenue,
            revenueByMonth,
            revenueByDay,
            bestSellingProducts: bestSellingAgg,
            userGenderDemographic,
            totalOrders,
            latestOrders,
            totalProducts,
            totalCoupons,
        },
    });
});
