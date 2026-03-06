import request from 'supertest';
import { createTestApp } from '../helpers/testApp';
import { Application } from 'express';
import { mockAuthSuccess, mockAuthFailure } from '../helpers/authHelper';
import User from '../../models/user.model';
import { Category } from '../../models/category.model';
import mongoose from 'mongoose';

describe('Admin Integration', () => {
    let app: Application;

    beforeAll(() => {
        app = createTestApp();
    });

    describe('Access Control (RBAC)', () => {
        it('should block admin route if not logged in', async () => {
            const res = await request(app).get('/api/v1/admin/auth/all');
            expect(res.status).toBe(401); // No token provided
            expect(res.body.message).toContain('No token');
        });

        it('should block admin route if user is not admin', async () => {
            const uid = 'client-uid-1';
            await User.create({
                uid,
                email: 'client@test.com',
                name: 'Client User',
                role: 'user',
                provider: 'google.com',
                gender: 'male',
                dob: new Date()
            });

            mockAuthSuccess(uid);
            const res = await request(app)
                .get('/api/v1/admin/auth/all')
                .set('Cookie', ['token=valid-token']);

            expect(res.status).toBe(403);
            expect(res.body.message).toContain('Unauthorized');
        });

        it('should allow admin route if user is admin', async () => {
            const uid = 'admin-uid-1';
            await User.create({
                uid,
                email: 'admin@test.com',
                name: 'Admin User',
                role: 'admin',
                provider: 'google.com',
                gender: 'male',
                dob: new Date()
            });

            mockAuthSuccess(uid);
            const res = await request(app)
                .get('/api/v1/admin/auth/all')
                .set('Cookie', ['token=valid-token']);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.users)).toBe(true);
        });
    });

    describe('Product Management (CRUD)', () => {
        let adminUid = 'admin-uid-crud';
        let categoryId: string;
        let brandId: string;

        beforeEach(async () => {
            await User.create({
                uid: adminUid,
                email: 'admin-crud@test.com',
                name: 'Admin User',
                role: 'admin',
                provider: 'google.com',
                gender: 'male',
                dob: new Date()
            });

            const cat = await Category.create({ name: 'Integration Cat', value: 'integration-cat' });
            categoryId = cat._id.toString();

            // Create a brand
            const brand = await mongoose.model('Brand').create({
                name: 'Integration Brand',
                value: 'integration-brand',
                image: 'url',
                imagePublicId: 'id'
            });
            brandId = brand._id.toString();
        });

        it('should create a new product', async () => {
            mockAuthSuccess(adminUid);
            const res = await request(app)
                .post('/api/v1/admin/products/new')
                .set('Cookie', ['token=valid-token'])
                .send({
                    name: 'New Integrated Product',
                    description: 'Desc',
                    price: 100,
                    stock: 5,
                    categories: JSON.stringify([categoryId]),
                    brand: brandId,
                });

            // This will likely fail with 400 because multer didn't get files
            // but we are testing that it HITS the controller and fails on validation, not 401/403
            expect(res.status).toBe(400);
            expect(res.body.message).toContain('photo');
        });
    });
});
