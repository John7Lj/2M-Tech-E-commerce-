/**
 * Brand Controller Tests (full CRUD)
 */
import '../setup';
import { Brand } from '../../models/brand.model';
import {
    createBrand,
    updateBrand,
    deleteBrand,
} from '../../modules/admin/controllers/brand.controller';
import {
    getAllBrands,
    getBrandById,
    getBrandsForDropdown,
} from '../../modules/client/controllers/brand.controller';
import { Request, Response, NextFunction } from 'express';

// Mock cloudinary deleteImage
jest.mock('../../utils/cloudinary', () => ({
    deleteImage: jest.fn().mockResolvedValue(true),
    extractPublicId: jest.fn((url: string) => url),
    uploadImage: jest.fn(),
    uploadMultipleImages: jest.fn(),
}));

const mockReq = (body = {}, params = {}, query = {}, file: any = null): any => ({
    body, params, query, file,
});

const mockRes = (): any => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('Brand Controller', () => {
    // ─── createBrand ──────────────────────────────────────────
    describe('createBrand', () => {
        it('should create a brand with name and image', async () => {
            const req = mockReq({ name: 'Samsung' }, {}, {}, { path: 'http://cloud.com/samsung.png', filename: 'samsung-id' });
            const res = mockRes();
            const next = jest.fn();
            await createBrand(req, res, next);
            expect(res.status).toHaveBeenCalledWith(201);
            const data = res.json.mock.calls[0][0];
            expect(data.brand.name).toBe('Samsung');
        });

        it('should reject missing name', async () => {
            const req = mockReq({}, {}, {}, { path: 'img', filename: 'id' });
            const res = mockRes();
            const next = jest.fn();
            await createBrand(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0].statusCode).toBe(400);
        });

        it('should reject missing image', async () => {
            const req = mockReq({ name: 'NoImage' });
            const res = mockRes();
            const next = jest.fn();
            await createBrand(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0].statusCode).toBe(400);
        });

        it('should reject duplicate name (case-insensitive)', async () => {
            await Brand.create({ name: 'Samsung', image: 'img', imagePublicId: 'id' });
            const req = mockReq({ name: 'samsung' }, {}, {}, { path: 'img', filename: 'id2' });
            const res = mockRes();
            const next = jest.fn();
            await createBrand(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0].statusCode).toBe(400);
        });
    });

    // ─── getAllBrands ──────────────────────────────────────────
    describe('getAllBrands', () => {
        it('should return paginated brands', async () => {
            for (let i = 0; i < 25; i++) {
                await Brand.create({ name: `Brand ${i}`, image: 'img', imagePublicId: `id-${i}` });
            }
            const req = mockReq({}, {}, { page: '1', limit: '10' });
            const res = mockRes();
            const next = jest.fn();
            await getAllBrands(req, res, next);
            const data = res.json.mock.calls[0][0];
            expect(data.brands).toHaveLength(10);
            expect(data.totalBrands).toBe(25);
            expect(data.totalPages).toBe(3);
            expect(data.currentPage).toBe(1);
        });

        it('should return page 2', async () => {
            for (let i = 0; i < 15; i++) {
                await Brand.create({ name: `Brand ${i}`, image: 'img', imagePublicId: `id-${i}` });
            }
            const req = mockReq({}, {}, { page: '2', limit: '10' });
            const res = mockRes();
            const next = jest.fn();
            await getAllBrands(req, res, next);
            const data = res.json.mock.calls[0][0];
            expect(data.brands).toHaveLength(5);
        });
    });

    // ─── getBrandById ─────────────────────────────────────────
    describe('getBrandById', () => {
        it('should return brand by ID', async () => {
            const brand = await Brand.create({ name: 'Test', image: 'img', imagePublicId: 'id' });
            const req = mockReq({}, { id: brand._id.toString() });
            const res = mockRes();
            const next = jest.fn();
            await getBrandById(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json.mock.calls[0][0].brand.name).toBe('Test');
        });

        it('should return 404 for non-existent brand', async () => {
            const req = mockReq({}, { id: '507f1f77bcf86cd799439011' });
            const res = mockRes();
            const next = jest.fn();
            await getBrandById(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0].statusCode).toBe(404);
        });
    });

    // ─── updateBrand ──────────────────────────────────────────
    describe('updateBrand', () => {
        it('should update brand name', async () => {
            const brand = await Brand.create({ name: 'OldName', image: 'img', imagePublicId: 'id' });
            const req = mockReq({ name: 'NewName' }, { id: brand._id.toString() });
            const res = mockRes();
            const next = jest.fn();
            await updateBrand(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            const updated = await Brand.findById(brand._id);
            expect(updated!.name).toBe('NewName');
        });

        it('should update image when new file provided', async () => {
            const brand = await Brand.create({ name: 'Brand', image: 'old.jpg', imagePublicId: 'old-id' });
            const req = mockReq({}, { id: brand._id.toString() }, {}, { path: 'new.jpg', filename: 'new-id' });
            const res = mockRes();
            const next = jest.fn();
            await updateBrand(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            const updated = await Brand.findById(brand._id);
            expect(updated!.image).toBe('new.jpg');
        });

        it('should reject duplicate name on update', async () => {
            await Brand.create({ name: 'Existing', image: 'img', imagePublicId: 'id1' });
            const brand = await Brand.create({ name: 'ToUpdate', image: 'img', imagePublicId: 'id2' });
            const req = mockReq({ name: 'Existing' }, { id: brand._id.toString() });
            const res = mockRes();
            const next = jest.fn();
            await updateBrand(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0].statusCode).toBe(400);
        });
    });

    // ─── deleteBrand ──────────────────────────────────────────
    describe('deleteBrand', () => {
        it('should delete brand and its image', async () => {
            const brand = await Brand.create({ name: 'Del', image: 'img', imagePublicId: 'del-id' });
            const req = mockReq({}, { id: brand._id.toString() });
            const res = mockRes();
            const next = jest.fn();
            await deleteBrand(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            const deleted = await Brand.findById(brand._id);
            expect(deleted).toBeNull();
        });

        it('should return 404 for non-existent brand', async () => {
            const req = mockReq({}, { id: '507f1f77bcf86cd799439011' });
            const res = mockRes();
            const next = jest.fn();
            await deleteBrand(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0].statusCode).toBe(404);
        });
    });

    // ─── getBrandsForDropdown ─────────────────────────────────
    describe('getBrandsForDropdown', () => {
        it('should return brands sorted by name for dropdown', async () => {
            await Brand.create({ name: 'Zebra', image: 'img', imagePublicId: 'z' });
            await Brand.create({ name: 'Apple', image: 'img', imagePublicId: 'a' });

            const req = mockReq();
            const res = mockRes();
            const next = jest.fn();
            await getBrandsForDropdown(req, res, next);
            const data = res.json.mock.calls[0][0];
            expect(data.brands).toHaveLength(2);
            expect(data.brands[0].name).toBe('Apple'); // sorted alphabetically
        });
    });
});
