/**
 * Stats Controller Tests
 * Tests the dashboard statistics aggregation endpoint
 */
import '../setup';
import User from '../../models/user.model';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { Brand } from '../../models/brand.model';
import Order from '../../models/order.model';
import Coupon from '../../models/coupon.model';
import { getStats } from '../../modules/admin/controllers/stats.controller';
import { Request, Response, NextFunction } from 'express';

const mockReq = (): Request => ({} as Request);

const mockRes = (): any => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('Stats Controller', () => {
    describe('getStats', () => {
        it('should return zero stats when no data exists', async () => {
            const req = mockReq();
            const res = mockRes();
            const next = jest.fn();
            await getStats(req, res, next);
            const data = res.json.mock.calls[0][0];
            expect(data.success).toBe(true);
            expect(data.stats.totalRevenue).toBe(0);
            expect(data.stats.totalOrders).toBe(0);
            expect(data.stats.totalProducts).toBe(0);
            expect(data.stats.totalCoupons).toBe(0);
            expect(data.stats.latestOrders).toEqual([]);
        });

        it('should compute correct revenue and counts', async () => {
            const cat = await Category.create({ name: 'E', value: 'e' });
            const brand = await Brand.create({ name: 'B', image: 'img', imagePublicId: 'bid' });
            const user = await User.create({
                uid: 'stats-u1', email: 's@t.com', name: 'Stats User',
                provider: 'g', gender: 'male', dob: new Date('2000-01-01'),
            });

            await Product.create({
                name: 'P1', price: 100, netPrice: 100, stock: 5,
                categories: [cat._id], brand: brand._id,
                description: 'x', photos: ['img'], photoPublicIds: ['id'],
            });
            await Product.create({
                name: 'P2', price: 200, netPrice: 200, stock: 5,
                categories: [cat._id], brand: brand._id,
                description: 'x', photos: ['img'], photoPublicIds: ['id'],
            });

            await Order.create({
                shippingInfo: { address: 'A', city: 'B', phone: '123', country: 'C' },
                user: user._id, subtotal: 100, tax: 10, shippingCharges: 5, total: 115,
                orderItems: [{ name: 'P1', photo: 'img', price: 100, quantity: 1, productId: '507f1f77bcf86cd799439011' }],
            });
            await Order.create({
                shippingInfo: { address: 'A', city: 'B', phone: '123', country: 'C' },
                user: user._id, subtotal: 200, tax: 20, shippingCharges: 10, total: 230,
                orderItems: [{ name: 'P2', photo: 'img', price: 200, quantity: 2, productId: '507f1f77bcf86cd799439012' }],
            });

            await Coupon.create({ code: 'C1', amount: 10 });

            const req = mockReq();
            const res = mockRes();
            const next = jest.fn();
            await getStats(req, res, next);

            const data = res.json.mock.calls[0][0];
            expect(data.stats.totalRevenue).toBe(345); // 115 + 230
            expect(data.stats.totalOrders).toBe(2);
            expect(data.stats.totalProducts).toBe(2);
            expect(data.stats.totalCoupons).toBe(1);
            expect(data.stats.latestOrders).toHaveLength(2);
        });

        it('should compute best selling products from order items', async () => {
            const user = await User.create({
                uid: 'stats-u2', email: 's2@t.com', name: 'Stats User 2',
                provider: 'g', gender: 'female', dob: new Date('2000-01-01'),
            });

            await Order.create({
                shippingInfo: { address: 'A', city: 'B', phone: '123', country: 'C' },
                user: user._id, subtotal: 300, tax: 30, shippingCharges: 0, total: 330,
                orderItems: [
                    { name: 'Phone', photo: 'img', price: 100, quantity: 5, productId: '507f1f77bcf86cd799439011' },
                    { name: 'Tablet', photo: 'img', price: 200, quantity: 1, productId: '507f1f77bcf86cd799439012' },
                ],
            });

            const req = mockReq();
            const res = mockRes();
            const next = jest.fn();
            await getStats(req, res, next);

            const data = res.json.mock.calls[0][0];
            expect(data.stats.bestSellingProducts.length).toBeGreaterThan(0);
            expect(data.stats.bestSellingProducts[0].quantity).toBe(5);
        });

        it('should compute user gender demographics', async () => {
            await User.create({ uid: 'g1', email: 'g1@t.com', name: 'M1', provider: 'g', gender: 'male', dob: new Date('2000-01-01') });
            await User.create({ uid: 'g2', email: 'g2@t.com', name: 'M2', provider: 'g', gender: 'male', dob: new Date('2000-01-01') });
            await User.create({ uid: 'g3', email: 'g3@t.com', name: 'F1', provider: 'g', gender: 'female', dob: new Date('2000-01-01') });

            const req = mockReq();
            const res = mockRes();
            const next = jest.fn();
            await getStats(req, res, next);

            const data = res.json.mock.calls[0][0];
            const demographics = data.stats.userGenderDemographic;
            expect(demographics).toHaveLength(2);
            const maleCount = demographics.find((d: any) => d._id === 'male');
            const femaleCount = demographics.find((d: any) => d._id === 'female');
            expect(maleCount?.count).toBe(2);
            expect(femaleCount?.count).toBe(1);
        });
    });
});
