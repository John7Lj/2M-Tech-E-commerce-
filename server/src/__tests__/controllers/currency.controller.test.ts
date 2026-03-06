/**
 * Currency Controller Tests
 */
import '../setup';
import { Currency } from '../../models/currency.model';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { Brand } from '../../models/brand.model';
import {
    createCurrency,
    setDefaultCurrency,
    deleteCurrency,
} from '../../modules/admin/controllers/currency.controller';
import {
    getAllCurrencies,
    getDefaultCurrency,
} from '../../modules/client/controllers/currency.controller';
import { Request, Response } from 'express';

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

describe('Currency Controller', () => {
    describe('createCurrency', () => {
        it('should create a new currency', async () => {
            const req = mockReq({ symbol: '€' });
            const res = mockRes();
            const next = jest.fn();
            await createCurrency(req, res, next);
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should reject empty symbol', async () => {
            const req = mockReq({ symbol: '' });
            const res = mockRes();
            const next = jest.fn();
            await createCurrency(req, res, next);
            expect(next).toHaveBeenCalled();
        });

        it('should reject duplicate symbol', async () => {
            await Currency.create({ symbol: '$' });
            const req = mockReq({ symbol: '$' });
            const res = mockRes();
            const next = jest.fn();
            await createCurrency(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0].statusCode).toBe(400);
        });
    });

    describe('setDefaultCurrency', () => {
        it('should set a currency as default and update products', async () => {
            const cat = await Category.create({ name: 'Test', value: 'test' });
            const brand = await Brand.create({ name: 'Brand', image: 'img', imagePublicId: 'id' });
            await Product.create({
                name: 'P1', price: 100, netPrice: 100, stock: 5,
                categories: [cat._id], brand: brand._id,
                description: 'test', photos: ['img'], photoPublicIds: ['id'],
                currencySymbol: '$',
            });

            const currency = await Currency.create({ symbol: '€' });
            const req = mockReq({}, { currencyId: currency._id.toString() });
            const res = mockRes();
            const next = jest.fn();
            await setDefaultCurrency(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);

            // Check product was updated
            const product = await Product.findOne({ name: 'P1' });
            expect(product?.currencySymbol).toBe('€');
        });
    });

    describe('deleteCurrency', () => {
        it('should delete a non-default currency', async () => {
            const curr = await Currency.create({ symbol: '£' });
            const req = mockReq({}, { currencyId: curr._id.toString() });
            const res = mockRes();
            const next = jest.fn();
            await deleteCurrency(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should reject deleting default currency', async () => {
            const curr = await Currency.create({ symbol: '$', isDefault: true });
            const req = mockReq({}, { currencyId: curr._id.toString() });
            const res = mockRes();
            const next = jest.fn();
            await deleteCurrency(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0].message).toContain('default');
        });
    });

    describe('getAllCurrencies', () => {
        it('should return all currencies', async () => {
            await Currency.create({ symbol: '$' });
            await Currency.create({ symbol: '€' });
            const req = mockReq();
            const res = mockRes();
            const next = jest.fn();
            await getAllCurrencies(req, res, next);
            const data = (res.json as jest.Mock).mock.calls[0][0];
            expect(data.currencies).toHaveLength(2);
        });
    });

    describe('getDefaultCurrency', () => {
        it('should return default currency', async () => {
            await Currency.create({ symbol: '$', isDefault: true });
            await Currency.create({ symbol: '€' });
            const req = mockReq();
            const res = mockRes();
            const next = jest.fn();
            await getDefaultCurrency(req, res, next);
            const data = (res.json as jest.Mock).mock.calls[0][0];
            expect(data.currency.symbol).toBe('$');
        });
    });
});
