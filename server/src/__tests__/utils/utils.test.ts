/**
 * Utils & Middleware Tests
 * Tests ApiError, asyncHandler, and product.service utility functions.
 */
import { ApiError, apiErrorMiddleware } from '../../utils/ApiError';
import { asyncHandler } from '../../utils/asyncHandler';
import { ProductService } from '../../services/product.service';
import { Request, Response, NextFunction } from 'express';

// ─── ApiError ─────────────────────────────────────────────────
describe('ApiError', () => {
    it('should create an error with statusCode and message', () => {
        const err = new ApiError(404, 'Not found');
        expect(err.statusCode).toBe(404);
        expect(err.message).toBe('Not found');
        expect(err).toBeInstanceOf(Error);
    });

    it('should inherit from Error', () => {
        const err = new ApiError(500, 'Server error');
        expect(err.stack).toBeDefined();
    });
});

// ─── apiErrorMiddleware ───────────────────────────────────────
describe('apiErrorMiddleware', () => {
    const mockRes = () => {
        const res: Partial<Response> = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res as Response;
    };

    it('should return structured error response', () => {
        const err = new ApiError(400, 'Bad request');
        const res = mockRes();
        apiErrorMiddleware(err, {} as Request, res, jest.fn() as NextFunction);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Bad request',
        });
    });

    it('should default to 500 if no statusCode', () => {
        const err = { message: 'Oops' } as ApiError;
        const res = mockRes();
        apiErrorMiddleware(err, {} as Request, res, jest.fn() as NextFunction);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should handle CastError (invalid MongoDB ID)', () => {
        const err = new ApiError(400, 'Original message');
        err.name = 'CastError';
        const res = mockRes();
        apiErrorMiddleware(err, {} as Request, res, jest.fn() as NextFunction);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Invalid ID',
        });
    });
});

// ─── asyncHandler ─────────────────────────────────────────────
describe('asyncHandler', () => {
    it('should forward resolved value', async () => {
        const handler = asyncHandler(async (req, res) => {
            (res as any).status(200).json({ ok: true });
        });

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        await handler({} as Request, res as any, jest.fn());
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should call next with error on rejection', async () => {
        const testError = new Error('async failure');
        const handler = asyncHandler(async () => {
            throw testError;
        });

        const next = jest.fn();
        await handler({} as Request, {} as Response, next);
        expect(next).toHaveBeenCalledWith(testError);
    });
});

// ─── ProductService ───────────────────────────────────────────
describe('ProductService', () => {
    describe('buildSortQuery', () => {
        it('should return empty object for no sortBy', () => {
            expect(ProductService.buildSortQuery(undefined)).toEqual({});
            expect(ProductService.buildSortQuery(null)).toEqual({});
            expect(ProductService.buildSortQuery({})).toEqual({});
        });

        it('should build ascending sort', () => {
            expect(ProductService.buildSortQuery({ id: 'price', desc: false })).toEqual({ price: 1 });
        });

        it('should build descending sort', () => {
            expect(ProductService.buildSortQuery({ id: 'price', desc: true })).toEqual({ price: -1 });
        });
    });

    describe('processUploadedFiles', () => {
        it('should throw on empty files', async () => {
            await expect(ProductService.processUploadedFiles([])).rejects.toThrow('at least one photo');
        });

        it('should throw on too many files', async () => {
            const files = Array(11).fill({ path: '/path', filename: 'file', originalname: 'f.jpg' });
            await expect(ProductService.processUploadedFiles(files as any)).rejects.toThrow('Maximum 10');
        });

        it('should process valid files', async () => {
            const files = [
                { path: 'http://cloud.com/img1.jpg', filename: 'img1-public-id', originalname: 'img1.jpg' },
                { path: 'http://cloud.com/img2.jpg', filename: 'img2-public-id', originalname: 'img2.jpg' },
            ];
            const result = await ProductService.processUploadedFiles(files as any);
            expect(result.photos).toHaveLength(2);
            expect(result.photoPublicIds).toHaveLength(2);
            expect(result.photos[0]).toBe('http://cloud.com/img1.jpg');
        });
    });
});
