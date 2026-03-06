/**
 * Banner Controller Tests
 * Tests CRUD + discount apply/restore logic
 */
import '../setup';
import { Banner } from '../../models/banner.model';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { Brand } from '../../models/brand.model';
import {
    createBanner,
    getAllBanners,
    getBannerById,
    deleteBanner,
    toggleBannerStatus,
} from '../../controllers/banner.controller';
import { Request, Response, NextFunction } from 'express';

let categoryId: string;
let brandId: string;
let productId: string;

const mockReq = (body = {}, params = {}, query = {}, file: any = null): any => ({
    body, params, query, file,
});

const mockRes = (): any => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('Banner Controller', () => {
    beforeEach(async () => {
        const cat = await Category.create({ name: 'Electronics', value: 'electronics' });
        const brand = await Brand.create({ name: 'Samsung', image: 'img', imagePublicId: 'samsung' });
        const product = await Product.create({
            name: 'Phone', price: 1000, netPrice: 1000, stock: 10, discount: 0,
            categories: [cat._id], brand: brand._id,
            description: 'A phone', photos: ['img.jpg'], photoPublicIds: ['ph1'],
        });
        categoryId = cat._id.toString();
        brandId = brand._id.toString();
        productId = product._id.toString();
    });

    // ─── createBanner ─────────────────────────────────────────
    describe('createBanner', () => {
        it('should create a banner', async () => {
            const req = mockReq(
                {
                    name: 'Summer Sale',
                    description: 'Big discounts',
                    products: JSON.stringify([{ product: productId, discountPercentage: 20 }]),
                    isActive: false,
                },
                {}, {},
                { path: 'http://cloud.com/banner.jpg', filename: 'banner-id' }
            );
            const res = mockRes();
            const next = jest.fn();
            await createBanner(req, res, next);
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should reject missing name', async () => {
            const req = mockReq({ description: 'X', products: '[]' });
            const res = mockRes();
            const next = jest.fn();
            await createBanner(req, res, next);
            expect(next).toHaveBeenCalled();
        });

        it('should reject invalid discount percentage', async () => {
            const req = mockReq(
                {
                    name: 'Bad',
                    description: 'X',
                    products: JSON.stringify([{ product: productId, discountPercentage: 150 }]),
                },
                {}, {},
                { path: 'img', filename: 'id' }
            );
            const res = mockRes();
            const next = jest.fn();
            await createBanner(req, res, next);
            expect(next).toHaveBeenCalled();
        });

        it('should apply discounts when banner is active', async () => {
            const req = mockReq(
                {
                    name: 'Active Sale',
                    description: 'Discounts now',
                    products: JSON.stringify([{ product: productId, discountPercentage: 30 }]),
                    isActive: true,
                },
                {}, {},
                { path: 'img', filename: 'id' }
            );
            const res = mockRes();
            const next = jest.fn();
            await createBanner(req, res, next);
            expect(res.status).toHaveBeenCalledWith(201);

            // Product should have 30% discount applied
            const product = await Product.findById(productId);
            expect(product!.discount).toBe(30);
            expect(product!.netPrice).toBe(700); // 1000 - 30%
        });
    });

    // ─── getAllBanners ─────────────────────────────────────────
    describe('getAllBanners', () => {
        it('should return only active banners by default', async () => {
            await Banner.create({ name: 'Active', description: 'x', isActive: true, products: [], image: 'img', imagePublicId: 'id' });
            await Banner.create({ name: 'Inactive', description: 'x', isActive: false, products: [], image: 'img', imagePublicId: 'id' });
            const req = mockReq({}, {}, {});
            const res = mockRes();
            const next = jest.fn();
            await getAllBanners(req, res, next);
            const data = res.json.mock.calls[0][0];
            expect(data.banners).toHaveLength(1);
        });

        it('should return all banners when includeInactive=true', async () => {
            await Banner.create({ name: 'Active', description: 'x', isActive: true, products: [], image: 'img', imagePublicId: 'id' });
            await Banner.create({ name: 'Inactive', description: 'x', isActive: false, products: [], image: 'img', imagePublicId: 'id' });
            const req = mockReq({}, {}, { includeInactive: 'true' });
            const res = mockRes();
            const next = jest.fn();
            await getAllBanners(req, res, next);
            const data = res.json.mock.calls[0][0];
            expect(data.banners).toHaveLength(2);
        });
    });

    // ─── getBanner ────────────────────────────────────────────
    describe('getBanner', () => {
        it('should return banner by ID', async () => {
            const banner = await Banner.create({ name: 'Test', description: 'x', products: [], image: 'img', imagePublicId: 'id' });
            const req = mockReq({}, { id: banner._id.toString() });
            const res = mockRes();
            const next = jest.fn();
            await getBannerById(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return 404 for non-existent', async () => {
            const req = mockReq({}, { id: '507f1f77bcf86cd799439011' });
            const res = mockRes();
            const next = jest.fn();
            await getBannerById(req, res, next);
            expect(next).toHaveBeenCalled();
        });
    });

    // ─── toggleBannerStatus ───────────────────────────────────
    describe('toggleBannerStatus', () => {
        it('should toggle from inactive to active and apply discounts', async () => {
            const banner = await Banner.create({
                name: 'Toggle',
                description: 'x',
                isActive: false,
                products: [{ product: productId, discountPercentage: 25, originalDiscount: 0 }],
                image: 'img',
                imagePublicId: 'id'
            });
            const req = mockReq({}, { id: banner._id.toString() });
            const res = mockRes();
            const next = jest.fn();
            await toggleBannerStatus(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);

            const product = await Product.findById(productId);
            expect(product!.discount).toBe(25);
        });

        it('should toggle from active to inactive and restore discounts', async () => {
            // Set up product with banner discount
            await Product.findByIdAndUpdate(productId, { discount: 25, netPrice: 750 });

            const banner = await Banner.create({
                name: 'Toggle Off',
                description: 'x',
                isActive: true,
                products: [{ product: productId, discountPercentage: 25, originalDiscount: 0 }],
                image: 'img',
                imagePublicId: 'id'
            });
            const req = mockReq({}, { id: banner._id.toString() });
            const res = mockRes();
            const next = jest.fn();
            await toggleBannerStatus(req, res, next);

            // Product discount should be restored to original (0)
            const product = await Product.findById(productId);
            expect(product!.discount).toBe(0);
            expect(product!.netPrice).toBe(1000);
        });
    });

    // ─── deleteBanner ─────────────────────────────────────────
    describe('deleteBanner', () => {
        it('should delete banner and restore product discounts', async () => {
            await Product.findByIdAndUpdate(productId, { discount: 20, netPrice: 800 });

            const banner = await Banner.create({
                name: 'ToDelete',
                description: 'x',
                isActive: true,
                products: [{ product: productId, discountPercentage: 20, originalDiscount: 0 }],
                image: 'img',
                imagePublicId: 'id'
            });
            const req = mockReq({}, { id: banner._id.toString() });
            const res = mockRes();
            const next = jest.fn();
            await deleteBanner(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);

            // Product discount restored
            const product = await Product.findById(productId);
            expect(product!.discount).toBe(0);
            expect(product!.netPrice).toBe(1000);

            // Banner deleted
            const deleted = await Banner.findById(banner._id);
            expect(deleted).toBeNull();
        });

        it('should return 404 for non-existent banner', async () => {
            const req = mockReq({}, { id: '507f1f77bcf86cd799439011' });
            const res = mockRes();
            const next = jest.fn();
            await deleteBanner(req, res, next);
            expect(next).toHaveBeenCalled();
        });
    });
});
