import request from 'supertest';
import { createTestApp } from '../helpers/testApp';
import { Application } from 'express';

describe('Gateway Integration', () => {
    let app: Application;

    beforeAll(() => {
        app = createTestApp();
    });

    describe('Routing Separation', () => {
        it('should return 404 for non-existent routes in /api/v1', async () => {
            const res = await request(app).get('/api/v1/non-existent');
            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('API endpoint not found');
        });

        it('should route /api/v1/admin/auth/login even if role is not checked yet', async () => {
            const res = await request(app).post('/api/v1/admin/auth/login');
            expect(res.status).not.toBe(404);
            expect(res.status).not.toBe(403);
        });

        it('should route /api/v1/client/products/latest correctly', async () => {
            const res = await request(app).get('/api/v1/client/products/latest');
            expect(res.status).not.toBe(404);
        });
    });

    describe('Global Error Handling', () => {
        it('should handle API errors via middleware', async () => {
            const res = await request(app).get('/api/v1/client/products/invalid-id');
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });
});
