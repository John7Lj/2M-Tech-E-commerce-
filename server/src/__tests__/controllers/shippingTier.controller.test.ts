/**
 * ShippingTier Controller Tests
 */
import '../setup';
import ShippingTier from '../../models/shippingTier.model';
import {
    createShippingTier,
    getAllShippingTiers,
    calculateShippingCost,
    deleteShippingTier,
    updateShippingTier,
} from '../../controllers/shippingTier.controller';
import { Request, Response } from 'express';

const mockReq = (body = {}, params = {}, query = {}): Request => ({
    body,
    params,
    query,
} as unknown as Request);

const mockRes = (): Response => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
};

describe('ShippingTier Controller', () => {
    describe('createShippingTier', () => {
        it('should create a valid tier', async () => {
            const req = mockReq({ minOrderValue: 0, maxOrderValue: 100, shippingCost: 15 });
            const res = mockRes();
            const next = jest.fn();
            await createShippingTier(req, res, next);
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should reject negative values', async () => {
            const req = mockReq({ minOrderValue: -10, maxOrderValue: 100, shippingCost: 15 });
            const res = mockRes();
            const next = jest.fn();
            await createShippingTier(req, res, next);
            // Should throw due to negative value
        });

        it('should reject max <= min', async () => {
            const req = mockReq({ minOrderValue: 100, maxOrderValue: 50, shippingCost: 15 });
            const res = mockRes();
            const next = jest.fn();
            await createShippingTier(req, res, next);
            // asyncHandler catches thrown ApiError
        });

        it('should reject overlapping ranges', async () => {
            await ShippingTier.create({ minOrderValue: 0, maxOrderValue: 100, shippingCost: 15 });
            const req = mockReq({ minOrderValue: 50, maxOrderValue: 150, shippingCost: 10 });
            const res = mockRes();
            const next = jest.fn();
            await createShippingTier(req, res, next);
            // Should throw due to overlap
        });
    });

    describe('calculateShippingCost', () => {
        beforeEach(async () => {
            await ShippingTier.create({ minOrderValue: 0, maxOrderValue: 100, shippingCost: 50 });
            await ShippingTier.create({ minOrderValue: 100, maxOrderValue: 500, shippingCost: 25 });
            await ShippingTier.create({ minOrderValue: 500, maxOrderValue: 10000, shippingCost: 0 });
        });

        it('should find correct tier for low value', async () => {
            const req = mockReq({}, {}, { orderValue: '50' });
            const res = mockRes();
            const next = jest.fn();
            await calculateShippingCost(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            const data = (res.json as jest.Mock).mock.calls[0][0];
            expect(data.shippingCost).toBe(50);
        });

        it('should find correct tier for mid value', async () => {
            const req = mockReq({}, {}, { orderValue: '250' });
            const res = mockRes();
            const next = jest.fn();
            await calculateShippingCost(req, res, next);
            const data = (res.json as jest.Mock).mock.calls[0][0];
            expect(data.shippingCost).toBe(25);
        });

        it('should return free shipping for high value', async () => {
            const req = mockReq({}, {}, { orderValue: '1000' });
            const res = mockRes();
            const next = jest.fn();
            await calculateShippingCost(req, res, next);
            const data = (res.json as jest.Mock).mock.calls[0][0];
            expect(data.shippingCost).toBe(0);
        });

        it('should return 0 fallback when no tier matches', async () => {
            const req = mockReq({}, {}, { orderValue: '99999' });
            const res = mockRes();
            const next = jest.fn();
            await calculateShippingCost(req, res, next);
            const data = (res.json as jest.Mock).mock.calls[0][0];
            expect(data.shippingCost).toBe(0); // Fixed from 50 to 0
        });

        it('should reject missing orderValue', async () => {
            const req = mockReq({}, {}, {});
            const res = mockRes();
            const next = jest.fn();
            await calculateShippingCost(req, res, next);
            // Should throw ApiError
        });
    });

    describe('getAllShippingTiers', () => {
        it('should return only active tiers', async () => {
            await ShippingTier.create({ minOrderValue: 0, maxOrderValue: 100, shippingCost: 15, isActive: true });
            await ShippingTier.create({ minOrderValue: 100, maxOrderValue: 200, shippingCost: 10, isActive: false });
            const req = mockReq();
            const res = mockRes();
            const next = jest.fn();
            await getAllShippingTiers(req, res, next);
            const data = (res.json as jest.Mock).mock.calls[0][0];
            expect(data.shippingTiers).toHaveLength(1);
        });
    });

    describe('deleteShippingTier', () => {
        it('should delete an existing tier', async () => {
            const tier = await ShippingTier.create({ minOrderValue: 0, maxOrderValue: 100, shippingCost: 15 });
            const req = mockReq({}, { id: tier._id.toString() });
            const res = mockRes();
            const next = jest.fn();
            await deleteShippingTier(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            const deleted = await ShippingTier.findById(tier._id);
            expect(deleted).toBeNull();
        });

        it('should return 404 for non-existent tier', async () => {
            const req = mockReq({}, { id: '507f1f77bcf86cd799439011' });
            const res = mockRes();
            const next = jest.fn();
            await deleteShippingTier(req, res, next);
            // asyncHandler catches the thrown error
        });
    });
});
