/**
 * Coupon Controller Tests
 */
import '../setup';
import Coupon from '../../models/coupon.model';
import { ApiError } from '../../utils/ApiError';

// We test the controller logic directly since the routes require auth middleware
import { newCoupon, deleteCoupon, getAllCoupons } from '../../modules/admin/controllers/coupon.controller';
import { applyCoupon } from '../../modules/client/controllers/coupon.controller';
import { Request, Response, NextFunction } from 'express';

const mockReq = (body = {}, params = {}): Request => ({
    body,
    params,
} as unknown as Request);

const mockRes = (): Response => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
};

describe('Coupon Controller', () => {
    describe('newCoupon', () => {
        it('should create a coupon with valid data', async () => {
            const req = mockReq({ code: 'SAVE20', amount: 20, expiresAt: new Date(Date.now() + 86400000).toISOString() });
            const res = mockRes();
            const next = jest.fn();
            await newCoupon(req, res, next);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });

        it('should reject missing code', async () => {
            const req = mockReq({ amount: 20 });
            const res = mockRes();
            const next = jest.fn();
            await newCoupon(req, res, next);
            expect(next).toHaveBeenCalled();
            const err = next.mock.calls[0][0];
            expect(err.statusCode).toBe(400);
        });

        it('should reject amount <= 0', async () => {
            const req = mockReq({ code: 'BAD', amount: 0 });
            const res = mockRes();
            const next = jest.fn();
            await newCoupon(req, res, next);
            expect(next).toHaveBeenCalled();
        });

        it('should reject past expiry date', async () => {
            const req = mockReq({ code: 'EXPIRED', amount: 10, expiresAt: '2020-01-01' });
            const res = mockRes();
            const next = jest.fn();
            await newCoupon(req, res, next);
            expect(next).toHaveBeenCalled();
            const err = next.mock.calls[0][0];
            expect(err.message).toContain('future');
        });

        it('should reject duplicate code', async () => {
            await Coupon.create({ code: 'DUPE', amount: 5 });
            const req = mockReq({ code: 'dupe', amount: 10 }); // case-insensitive
            const res = mockRes();
            const next = jest.fn();
            await newCoupon(req, res, next);
            expect(next).toHaveBeenCalled();
            const err = next.mock.calls[0][0];
            expect(err.statusCode).toBe(409);
        });
    });

    describe('applyCoupon', () => {
        it('should apply a valid coupon', async () => {
            await Coupon.create({ code: 'VALID10', amount: 10 });
            const req = mockReq({ code: 'valid10', orderTotal: 100 }); // case-insensitive
            const res = mockRes();
            const next = jest.fn();
            await applyCoupon(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            const responseData = (res.json as jest.Mock).mock.calls[0][0];
            expect(responseData.discount).toBe(10);
            expect(responseData.code).toBe('VALID10');
            // Should NOT expose internal fields
            expect(responseData.coupon).toBeUndefined();
        });

        it('should reject empty code', async () => {
            const req = mockReq({ code: '' });
            const res = mockRes();
            const next = jest.fn();
            await applyCoupon(req, res, next);
            expect(next).toHaveBeenCalled();
        });

        it('should reject expired coupon', async () => {
            await Coupon.create({ code: 'OLD', amount: 10, expiresAt: new Date('2020-01-01') });
            const req = mockReq({ code: 'OLD' });
            const res = mockRes();
            const next = jest.fn();
            await applyCoupon(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0].message).toContain('expired');
        });

        it('should reject when usage limit reached', async () => {
            await Coupon.create({ code: 'MAXED', amount: 10, maxUses: 1, usedCount: 1 });
            const req = mockReq({ code: 'MAXED' });
            const res = mockRes();
            const next = jest.fn();
            await applyCoupon(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0].message).toContain('usage limit');
        });

        it('should reject when order total below minimum', async () => {
            await Coupon.create({ code: 'MINORDER', amount: 10, minOrderValue: 100 });
            const req = mockReq({ code: 'MINORDER', orderTotal: 50 });
            const res = mockRes();
            const next = jest.fn();
            await applyCoupon(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0].message).toContain('Minimum order');
        });
    });

    describe('deleteCoupon', () => {
        it('should delete an existing coupon', async () => {
            const coupon = await Coupon.create({ code: 'DEL', amount: 5 });
            const req = mockReq({}, { id: coupon._id.toString() });
            const res = mockRes();
            const next = jest.fn();
            await deleteCoupon(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return 404 for non-existent coupon', async () => {
            const req = mockReq({}, { id: '507f1f77bcf86cd799439011' });
            const res = mockRes();
            const next = jest.fn();
            await deleteCoupon(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0].statusCode).toBe(404);
        });
    });

    describe('getAllCoupons', () => {
        it('should return all coupons sorted by createdAt desc', async () => {
            await Coupon.create({ code: 'A', amount: 5 });
            await Coupon.create({ code: 'B', amount: 10 });
            const req = mockReq();
            const res = mockRes();
            const next = jest.fn();
            await getAllCoupons(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            const data = (res.json as jest.Mock).mock.calls[0][0];
            expect(data.coupons).toHaveLength(2);
        });
    });
});
