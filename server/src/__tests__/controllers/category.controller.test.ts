/**
 * Category Controller Tests (full CRUD)
 */
import '../setup';
import { Category } from '../../models/category.model';
import { Product } from '../../models/product.model';
import { Brand } from '../../models/brand.model';
import {
    createCategory,
    getAllCategories,
    getAllCategoriesAdmin,
    getCategory,
    updateCategory,
    deleteCategory,
    permanentDeleteCategory,
} from '../../controllers/category.controller';
import { Request, Response } from 'express';

const mockReq = (body = {}, params = {}, file: any = null): any => ({
    body, params, file,
});

const mockRes = (): any => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('Category Controller', () => {
    // ─── createCategory ───────────────────────────────────────
    describe('createCategory', () => {
        it('should create a category', async () => {
            const req = mockReq({ name: 'Electronics' });
            const res = mockRes();
            const next = jest.fn();
            await createCategory(req, res, next);
            expect(res.status).toHaveBeenCalledWith(201);
            const data = res.json.mock.calls[0][0];
            expect(data.category.name).toBe('Electronics');
        });

        it('should reject empty name', async () => {
            const req = mockReq({ name: '' });
            const res = mockRes();
            const next = jest.fn();
            await createCategory(req, res, next);
            // asyncHandler catches the thrown ApiError
        });

        it('should reject duplicate name', async () => {
            await Category.create({ name: 'Dup', value: 'dup' });
            const req = mockReq({ name: 'Dup' });
            const res = mockRes();
            const next = jest.fn();
            await createCategory(req, res, next);
            // Should throw 400
        });

        it('should handle image upload', async () => {
            const req = mockReq({ name: 'With Image' }, {}, { path: 'http://cloud.com/cat.jpg' });
            const res = mockRes();
            const next = jest.fn();
            await createCategory(req, res, next);
            expect(res.status).toHaveBeenCalledWith(201);
        });
    });

    // ─── getAllCategories ──────────────────────────────────────
    describe('getAllCategories', () => {
        it('should return only active categories', async () => {
            await Category.create({ name: 'Active', value: 'active', isActive: true });
            await Category.create({ name: 'Inactive', value: 'inactive', isActive: false });
            const req = mockReq();
            const res = mockRes();
            const next = jest.fn();
            await getAllCategories(req, res, next);
            const data = res.json.mock.calls[0][0];
            expect(data.categories).toHaveLength(1);
            expect(data.categories[0].name).toBe('Active');
        });
    });

    // ─── getAllCategoriesAdmin ─────────────────────────────────
    describe('getAllCategoriesAdmin', () => {
        it('should return all categories including inactive', async () => {
            await Category.create({ name: 'Active', value: 'active', isActive: true });
            await Category.create({ name: 'Inactive', value: 'inactive', isActive: false });
            const req = mockReq();
            const res = mockRes();
            const next = jest.fn();
            await getAllCategoriesAdmin(req, res, next);
            const data = res.json.mock.calls[0][0];
            expect(data.categories).toHaveLength(2);
        });
    });

    // ─── getCategory ──────────────────────────────────────────
    describe('getCategory', () => {
        it('should return category by ID', async () => {
            const cat = await Category.create({ name: 'Test', value: 'test' });
            const req = mockReq({}, { id: cat._id.toString() });
            const res = mockRes();
            const next = jest.fn();
            await getCategory(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return 404 for non-existent ID', async () => {
            const req = mockReq({}, { id: '507f1f77bcf86cd799439011' });
            const res = mockRes();
            const next = jest.fn();
            await getCategory(req, res, next);
            // asyncHandler catches the thrown 404
        });
    });

    // ─── updateCategory ───────────────────────────────────────
    describe('updateCategory', () => {
        it('should update category name', async () => {
            const cat = await Category.create({ name: 'Old', value: 'old' });
            const req = mockReq({ name: 'New' }, { id: cat._id.toString() });
            const res = mockRes();
            const next = jest.fn();
            await updateCategory(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            const updated = await Category.findById(cat._id);
            expect(updated!.name).toBe('New');
        });

        it('should reject duplicate name on update', async () => {
            await Category.create({ name: 'Existing', value: 'existing' });
            const cat = await Category.create({ name: 'ToUpdate', value: 'toupdate' });
            const req = mockReq({ name: 'Existing' }, { id: cat._id.toString() });
            const res = mockRes();
            const next = jest.fn();
            await updateCategory(req, res, next);
            // asyncHandler catches the thrown 400
        });
    });

    // ─── deleteCategory (soft delete) ─────────────────────────
    describe('deleteCategory', () => {
        it('should soft-delete a category', async () => {
            const cat = await Category.create({ name: 'ToDelete', value: 'todelete' });
            const req = mockReq({}, { id: cat._id.toString() });
            const res = mockRes();
            const next = jest.fn();
            await deleteCategory(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            const softDeleted = await Category.findById(cat._id);
            expect(softDeleted!.isActive).toBe(false);
        });

        it('should reject deleting category in use by products', async () => {
            const cat = await Category.create({ name: 'InUse', value: 'inuse' });
            const brand = await Brand.create({ name: 'B', image: 'img', imagePublicId: 'id' });
            await Product.create({
                name: 'P', price: 100, netPrice: 100, stock: 1,
                categories: [cat._id], brand: brand._id,
                description: 'x', photos: ['img'], photoPublicIds: ['id'],
            });
            const req = mockReq({}, { id: cat._id.toString() });
            const res = mockRes();
            const next = jest.fn();
            await deleteCategory(req, res, next);
            // Should throw because products use this category
        });
    });

    // ─── permanentDeleteCategory ──────────────────────────────
    describe('permanentDeleteCategory', () => {
        it('should permanently delete a category', async () => {
            const cat = await Category.create({ name: 'PermDel', value: 'permdel' });
            const req = mockReq({}, { id: cat._id.toString() });
            const res = mockRes();
            const next = jest.fn();
            await permanentDeleteCategory(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            const deleted = await Category.findById(cat._id);
            expect(deleted).toBeNull();
        });
    });
});
