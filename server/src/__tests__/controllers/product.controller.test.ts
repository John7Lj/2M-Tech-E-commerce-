/**
 * Product Controller Tests
 * Tests product CRUD, search, filtering, featured/published toggling
 */
import '../setup';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { Subcategory } from '../../models/subcategory.model';
import { Brand } from '../../models/brand.model';
import {
    getLatestProducts,
    getAllProducts,
    getProductDetails,
    searchProducts,
    getAllCategories,
    toggleFeaturedStatus,
    togglePublishedStatus,
    getProductsByCategory,
    getProductsByBrand,
    getProductsBySubcategory,
} from '../../controllers/product.controller';
import { Request, Response, NextFunction } from 'express';

let categoryId: string;
let subcategoryId: string;
let brandId: string;

const mockReq = (body = {}, params = {}, query = {}, user: any = null): any => ({
    body, params, query, user,
});

const mockRes = (): any => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const createProductData = (overrides = {}) => ({
    name: 'Test Product',
    price: 100,
    netPrice: 100,
    stock: 10,
    categories: [categoryId],
    subcategories: [subcategoryId],
    brand: brandId,
    description: 'A great product',
    photos: ['http://img.com/1.jpg'],
    photoPublicIds: ['photo-1'],
    ...overrides,
});

describe('Product Controller', () => {
    beforeEach(async () => {
        const cat = await Category.create({ name: 'Electronics', value: 'electronics' });
        const subcat = await Subcategory.create({ name: 'Phones', value: 'phones', parentCategory: cat._id });
        const brand = await Brand.create({ name: 'Samsung', image: 'http://img.com/samsung.png', imagePublicId: 'samsung' });
        categoryId = cat._id.toString();
        subcategoryId = subcat._id.toString();
        brandId = brand._id.toString();
    });

    // ─── getLatestProducts ────────────────────────────────────
    describe('getLatestProducts', () => {
        it('should return latest products (published only)', async () => {
            await Product.create(createProductData({ name: 'P1', status: true }));
            await Product.create(createProductData({ name: 'P2', status: true }));
            await Product.create(createProductData({ name: 'Unpublished', status: false }));

            const req = mockReq({}, {}, { limit: '10' });
            const res = mockRes();
            const next = jest.fn();
            await getLatestProducts(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            const data = res.json.mock.calls[0][0];
            expect(data.products.length).toBe(2); // Only published
        });

        it('should limit results', async () => {
            for (let i = 0; i < 5; i++) {
                await Product.create(createProductData({ name: `P${i}` }));
            }
            const req = mockReq({}, {}, { limit: '2' });
            const res = mockRes();
            const next = jest.fn();
            await getLatestProducts(req, res, next);
            const data = res.json.mock.calls[0][0];
            expect(data.products.length).toBe(2);
        });
    });

    // ─── getAllProducts ────────────────────────────────────────
    describe('getAllProducts', () => {
        it('should return paginated products', async () => {
            for (let i = 0; i < 15; i++) {
                await Product.create(createProductData({ name: `Product ${i}` }));
            }
            const req = mockReq({}, {}, { page: '1', limit: '10' });
            const res = mockRes();
            const next = jest.fn();
            await getAllProducts(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            const data = res.json.mock.calls[0][0];
            expect(data.products.length).toBe(10);
            expect(data.totalProducts).toBe(15);
            expect(data.totalPages).toBe(2);
        });

        it('should filter by category', async () => {
            const cat2 = await Category.create({ name: 'Clothes', value: 'clothes' });
            await Product.create(createProductData({ name: 'Electronic Product' }));
            await Product.create(createProductData({ name: 'Clothing Product', categories: [cat2._id] }));

            const req = mockReq({}, {}, { page: '1', limit: '10', category: categoryId });
            const res = mockRes();
            const next = jest.fn();
            await getAllProducts(req, res, next);
            const data = res.json.mock.calls[0][0];
            expect(data.products.length).toBe(1);
            expect(data.products[0].name).toBe('Electronic Product');
        });

        it('should filter by brand', async () => {
            const brand2 = await Brand.create({ name: 'Apple', image: 'img', imagePublicId: 'apple' });
            await Product.create(createProductData({ name: 'Samsung Phone' }));
            await Product.create(createProductData({ name: 'Apple Phone', brand: brand2._id }));

            const req = mockReq({}, {}, { page: '1', limit: '10', brand: brandId });
            const res = mockRes();
            const next = jest.fn();
            await getAllProducts(req, res, next);
            const data = res.json.mock.calls[0][0];
            expect(data.products.length).toBe(1);
            expect(data.products[0].name).toBe('Samsung Phone');
        });
    });

    // ─── getProductDetails ────────────────────────────────────
    describe('getProductDetails', () => {
        it('should return product details with populated refs', async () => {
            const product = await Product.create(createProductData());
            const req = mockReq({}, { id: product._id.toString() });
            const res = mockRes();
            const next = jest.fn();
            await getProductDetails(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            const data = res.json.mock.calls[0][0];
            expect(data.product.name).toBe('Test Product');
        });

        it('should return 404 for non-existent product', async () => {
            const req = mockReq({}, { id: '507f1f77bcf86cd799439011' });
            const res = mockRes();
            const next = jest.fn();
            await getProductDetails(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0].statusCode).toBe(404);
        });
    });

    // ─── searchProducts ───────────────────────────────────────
    describe('searchProducts', () => {
        beforeEach(async () => {
            await Product.create(createProductData({ name: 'iPhone 15 Pro', price: 1200 }));
            await Product.create(createProductData({ name: 'Samsung Galaxy S24', price: 900 }));
            await Product.create(createProductData({ name: 'iPad Air', price: 600 }));
        });

        it('should search by name', async () => {
            const req = mockReq({}, {}, { search: 'iPhone', page: '1' });
            const res = mockRes();
            const next = jest.fn();
            await searchProducts(req, res, next);
            const data = res.json.mock.calls[0][0];
            expect(data.products.length).toBe(1);
            expect(data.products[0].name).toContain('iPhone');
        });

        it('should filter by price range', async () => {
            const req = mockReq({}, {}, { search: '', page: '1', price: '500,1000' });
            const res = mockRes();
            const next = jest.fn();
            await searchProducts(req, res, next);
            const data = res.json.mock.calls[0][0];
            expect(data.products.length).toBe(2); // Galaxy (900) and iPad (600)
        });

        it('should return empty results for no match', async () => {
            const req = mockReq({}, {}, { search: 'zzznonexistent', page: '1' });
            const res = mockRes();
            const next = jest.fn();
            await searchProducts(req, res, next);
            const data = res.json.mock.calls[0][0];
            expect(data.products.length).toBe(0);
        });
    });

    // ─── toggleFeaturedStatus ─────────────────────────────────
    describe('toggleFeaturedStatus', () => {
        it('should toggle featured from false to true', async () => {
            const product = await Product.create(createProductData({ featured: false }));
            const req = mockReq({}, { id: product._id.toString() });
            const res = mockRes();
            const next = jest.fn();
            await toggleFeaturedStatus(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            const dbProduct = await Product.findById(product._id);
            expect(dbProduct!.featured).toBe(true);
        });

        it('should toggle featured from true to false', async () => {
            const product = await Product.create(createProductData({ featured: true }));
            const req = mockReq({}, { id: product._id.toString() });
            const res = mockRes();
            const next = jest.fn();
            await toggleFeaturedStatus(req, res, next);
            const dbProduct = await Product.findById(product._id);
            expect(dbProduct!.featured).toBe(false);
        });

        it('should return 404 for non-existent product', async () => {
            const req = mockReq({}, { id: '507f1f77bcf86cd799439011' });
            const res = mockRes();
            const next = jest.fn();
            await toggleFeaturedStatus(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0].statusCode).toBe(404);
        });
    });

    // ─── togglePublishedStatus ────────────────────────────────
    describe('togglePublishedStatus', () => {
        it('should toggle published from true to false', async () => {
            const product = await Product.create(createProductData({ status: true }));
            const req = mockReq({}, { id: product._id.toString() });
            const res = mockRes();
            const next = jest.fn();
            await togglePublishedStatus(req, res, next);
            const dbProduct = await Product.findById(product._id);
            expect(dbProduct!.status).toBe(false);
        });
    });

    // ─── getProductsByCategory ────────────────────────────────
    describe('getProductsByCategory', () => {
        it('should return products by category ID', async () => {
            await Product.create(createProductData({ name: 'In Category' }));
            const cat2 = await Category.create({ name: 'Other', value: 'other' });
            await Product.create(createProductData({ name: 'Other Cat', categories: [cat2._id] }));

            const req = mockReq({}, { categoryId }, { limit: '10' });
            const res = mockRes();
            const next = jest.fn();
            await getProductsByCategory(req, res, next);
            const data = res.json.mock.calls[0][0];
            expect(data.products.length).toBe(1);
            expect(data.products[0].name).toBe('In Category');
        });
    });

    // ─── getProductsByBrand ───────────────────────────────────
    describe('getProductsByBrand', () => {
        it('should return products by brand ID', async () => {
            await Product.create(createProductData({ name: 'Samsung Phone' }));
            const brand2 = await Brand.create({ name: 'Apple', image: 'img', imagePublicId: 'a' });
            await Product.create(createProductData({ name: 'Apple Phone', brand: brand2._id }));

            const req = mockReq({}, { brandId }, { limit: '10' });
            const res = mockRes();
            const next = jest.fn();
            await getProductsByBrand(req, res, next);
            const data = res.json.mock.calls[0][0];
            expect(data.products.length).toBe(1);
            expect(data.products[0].name).toBe('Samsung Phone');
        });
    });

    // ─── getProductsBySubcategory ─────────────────────────────
    describe('getProductsBySubcategory', () => {
        it('should return products by subcategory ID', async () => {
            await Product.create(createProductData({ name: 'With Subcat' }));
            const sub2 = await Subcategory.create({ name: 'Tablets', value: 'tablets', parentCategory: categoryId });
            await Product.create(createProductData({ name: 'Other Subcat', subcategories: [sub2._id] }));

            const req = mockReq({}, { subcategoryId }, { limit: '10' });
            const res = mockRes();
            const next = jest.fn();
            await getProductsBySubcategory(req, res, next);
            const data = res.json.mock.calls[0][0];
            expect(data.products.length).toBe(1);
            expect(data.products[0].name).toBe('With Subcat');
        });
    });

    // ─── getAllCategories ─────────────────────────────────────
    describe('getAllCategories', () => {
        it('should return unique categories from products', async () => {
            await Product.create(createProductData({ name: 'P1' }));
            await Product.create(createProductData({ name: 'P2' }));
            const req = mockReq();
            const res = mockRes();
            const next = jest.fn();
            await getAllCategories(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});
