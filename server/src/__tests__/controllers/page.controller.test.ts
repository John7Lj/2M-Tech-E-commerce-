/**
 * Page Controller Tests
 */
import '../setup';
import { Page } from '../../models/page.model';
import {
import { createPage, updatePage, deletePage } from '../../modules/admin/controllers/page.controller';
import { getAllPages, getPageBySlug } from '../../modules/client/controllers/page.controller';
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

describe('Page Controller', () => {
    describe('createPage', () => {
        it('should create a page with valid data', async () => {
            const req = mockReq({
                title: 'About Us',
                slug: 'about-us',
                content: '<p>We are a great company</p>',
                isPublished: true,
            });
            const res = mockRes();
            const next = jest.fn();
            await createPage(req, res, next);
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should reject missing title', async () => {
            const req = mockReq({ slug: 'test', content: 'content' });
            const res = mockRes();
            const next = jest.fn();
            await createPage(req, res, next);
            expect(next).toHaveBeenCalled();
        });

        it('should reject duplicate slug', async () => {
            await Page.create({ title: 'Page 1', slug: 'duplicate', content: 'content' });
            const req = mockReq({ title: 'Page 2', slug: 'duplicate', content: 'content' });
            const res = mockRes();
            const next = jest.fn();
            await createPage(req, res, next);
            expect(next).toHaveBeenCalled();
        });
    });

    describe('getPageBySlug', () => {
        it('should return page by slug', async () => {
            await Page.create({ title: 'FAQ', slug: 'faq', content: '<p>FAQ content</p>', isPublished: true });
            const req = mockReq({}, { slug: 'faq' });
            const res = mockRes();
            const next = jest.fn();
            await getPageBySlug(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            const data = (res.json as jest.Mock).mock.calls[0][0];
            expect(data.page.title).toBe('FAQ');
        });

        it('should return 404 for non-existent slug', async () => {
            const req = mockReq({}, { slug: 'nonexistent' });
            const res = mockRes();
            const next = jest.fn();
            await getPageBySlug(req, res, next);
            expect(next).toHaveBeenCalled();
        });
    });

    describe('getAllPages', () => {
        it('should return all pages', async () => {
            await Page.create({ title: 'P1', slug: 'p1', content: 'c1' });
            await Page.create({ title: 'P2', slug: 'p2', content: 'c2' });
            const req = mockReq();
            const res = mockRes();
            const next = jest.fn();
            await getAllPages(req, res, next);
            const data = (res.json as jest.Mock).mock.calls[0][0];
            expect(data.pages).toHaveLength(2);
        });
    });

    describe('updatePage', () => {
        it('should update page with whitelisted fields only', async () => {
            const page = await Page.create({ title: 'Old Title', slug: 'old', content: 'old content' });
            const req = mockReq(
                { title: 'New Title', content: 'new content' },
                { id: page._id.toString() }
            );
            const res = mockRes();
            const next = jest.fn();
            await updatePage(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            const data = (res.json as jest.Mock).mock.calls[0][0];
            expect(data.page.title).toBe('New Title');
        });

        it('should return 404 for non-existent page', async () => {
            const req = mockReq({ title: 'X' }, { id: '507f1f77bcf86cd799439011' });
            const res = mockRes();
            const next = jest.fn();
            await updatePage(req, res, next);
            expect(next).toHaveBeenCalled();
        });
    });

    describe('deletePage', () => {
        it('should delete an existing page', async () => {
            const page = await Page.create({ title: 'Delete Me', slug: 'delete-me', content: 'x' });
            const req = mockReq({}, { id: page._id.toString() });
            const res = mockRes();
            const next = jest.fn();
            await deletePage(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            const deleted = await Page.findById(page._id);
            expect(deleted).toBeNull();
        });
    });
});
