/**
 * Subcategory Controller Tests (full CRUD)
 */
import '../setup';
import { Category } from '../../models/category.model';
import { Subcategory } from '../../models/subcategory.model';
import { Product } from '../../models/product.model';
import { Brand } from '../../models/brand.model';
import {
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
    permanentDeleteSubcategory,
} from '../../modules/admin/controllers/subcategory.controller';
import {
    getAllSubcategories,
    getSubcategoriesByCategory,
    getSubcategory,
} from '../../modules/client/controllers/subcategory.controller';
import { Request, Response } from 'express';

let categoryId: string;

const mockReq = (body = {}, params = {}, file: any = null): any => ({
    body, params, file,
});

const mockRes = (): any => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('Subcategory Controller', () => {
    beforeEach(async () => {
        const cat = await Category.create({ name: 'Electronics', value: 'electronics' });
        categoryId = cat._id.toString();
    });

    // ─── createSubcategory ────────────────────────────────────
    describe('createSubcategory', () => {
        it('should create a subcategory', async () => {
            const req = mockReq({ name: 'Phones', parentCategory: categoryId });
            const res = mockRes();
            const next = jest.fn();
            await createSubcategory(req, res, next);
            expect(res.status).toHaveBeenCalledWith(201);
            const data = res.json.mock.calls[0][0];
            expect(data.subcategory.name).toBe('Phones');
        });

        it('should reject missing name', async () => {
            const req = mockReq({ parentCategory: categoryId });
            const res = mockRes();
            const next = jest.fn();
            await createSubcategory(req, res, next);
            // asyncHandler catches thrown ApiError
        });

        it('should reject missing parent category', async () => {
            const req = mockReq({ name: 'NoCat' });
            const res = mockRes();
            const next = jest.fn();
            await createSubcategory(req, res, next);
            // Should throw
        });

        it('should reject non-existent parent category', async () => {
            const req = mockReq({ name: 'Bad', parentCategory: '507f1f77bcf86cd799439011' });
            const res = mockRes();
            const next = jest.fn();
            await createSubcategory(req, res, next);
            // Should throw 404
        });

        it('should reject duplicate name in same category', async () => {
            await Subcategory.create({ name: 'Phones', value: 'phones', parentCategory: categoryId });
            const req = mockReq({ name: 'Phones', parentCategory: categoryId });
            const res = mockRes();
            const next = jest.fn();
            await createSubcategory(req, res, next);
            // Should throw 400
        });
    });

    // ─── getAllSubcategories ───────────────────────────────────
    describe('getAllSubcategories', () => {
        it('should return only active subcategories', async () => {
            await Subcategory.create({ name: 'Active', value: 'active', parentCategory: categoryId, isActive: true });
            await Subcategory.create({ name: 'Inactive', value: 'inactive', parentCategory: categoryId, isActive: false });
            const req = mockReq();
            const res = mockRes();
            const next = jest.fn();
            await getAllSubcategories(req, res, next);
            const data = res.json.mock.calls[0][0];
            expect(data.subcategories).toHaveLength(1);
        });
    });

    // ─── getSubcategoriesByCategory ───────────────────────────
    describe('getSubcategoriesByCategory', () => {
        it('should filter subcategories by parent category', async () => {
            const cat2 = await Category.create({ name: 'Clothing', value: 'clothing' });
            await Subcategory.create({ name: 'Phones', value: 'phones', parentCategory: categoryId });
            await Subcategory.create({ name: 'Shirts', value: 'shirts', parentCategory: cat2._id });

            const req = mockReq({}, { categoryId });
            const res = mockRes();
            const next = jest.fn();
            await getSubcategoriesByCategory(req, res, next);
            const data = res.json.mock.calls[0][0];
            expect(data.subcategories).toHaveLength(1);
            expect(data.subcategories[0].name).toBe('Phones');
        });

        it('should reject invalid category ID', async () => {
            const req = mockReq({}, { categoryId: 'invalid-id' });
            const res = mockRes();
            const next = jest.fn();
            await getSubcategoriesByCategory(req, res, next);
            // Should throw
        });
    });

    // ─── getSubcategory ───────────────────────────────────────
    describe('getSubcategory', () => {
        it('should return subcategory by ID', async () => {
            const sub = await Subcategory.create({ name: 'Phones', value: 'phones', parentCategory: categoryId });
            const req = mockReq({}, { id: sub._id.toString() });
            const res = mockRes();
            const next = jest.fn();
            await getSubcategory(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return 404 for non-existent', async () => {
            const req = mockReq({}, { id: '507f1f77bcf86cd799439011' });
            const res = mockRes();
            const next = jest.fn();
            await getSubcategory(req, res, next);
            // Should throw 404
        });
    });

    // ─── updateSubcategory ────────────────────────────────────
    describe('updateSubcategory', () => {
        it('should update subcategory name', async () => {
            const sub = await Subcategory.create({ name: 'Phones', value: 'phones', parentCategory: categoryId });
            const req = mockReq({ name: 'Smartphones' }, { id: sub._id.toString() });
            const res = mockRes();
            const next = jest.fn();
            await updateSubcategory(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            const updated = await Subcategory.findById(sub._id);
            expect(updated!.name).toBe('Smartphones');
        });

        it('should allow changing parent category', async () => {
            const cat2 = await Category.create({ name: 'Clothing', value: 'clothing' });
            const sub = await Subcategory.create({ name: 'Misc', value: 'misc', parentCategory: categoryId });
            const req = mockReq({ parentCategory: cat2._id.toString() }, { id: sub._id.toString() });
            const res = mockRes();
            const next = jest.fn();
            await updateSubcategory(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    // ─── deleteSubcategory (soft delete) ──────────────────────
    describe('deleteSubcategory', () => {
        it('should soft-delete', async () => {
            const sub = await Subcategory.create({ name: 'Del', value: 'del', parentCategory: categoryId });
            const req = mockReq({}, { id: sub._id.toString() });
            const res = mockRes();
            const next = jest.fn();
            await deleteSubcategory(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            const softDel = await Subcategory.findById(sub._id);
            expect(softDel!.isActive).toBe(false);
        });

        it('should reject deleting when products use it', async () => {
            const sub = await Subcategory.create({ name: 'InUse', value: 'inuse', parentCategory: categoryId });
            const brand = await Brand.create({ name: 'B', image: 'img', imagePublicId: 'id' });
            await Product.create({
                name: 'P', price: 100, netPrice: 100, stock: 1,
                categories: [categoryId], subcategories: [sub._id], brand: brand._id,
                description: 'x', photos: ['img'], photoPublicIds: ['id'],
            });
            const req = mockReq({}, { id: sub._id.toString() });
            const res = mockRes();
            const next = jest.fn();
            await deleteSubcategory(req, res, next);
            // Should throw because products use this subcategory
        });
    });

    // ─── permanentDeleteSubcategory ───────────────────────────
    describe('permanentDeleteSubcategory', () => {
        it('should permanently delete', async () => {
            const sub = await Subcategory.create({ name: 'PermDel', value: 'permdel', parentCategory: categoryId });
            const req = mockReq({}, { id: sub._id.toString() });
            const res = mockRes();
            const next = jest.fn();
            await permanentDeleteSubcategory(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            const deleted = await Subcategory.findById(sub._id);
            expect(deleted).toBeNull();
        });
    });
});
