import request from 'supertest';
import { createTestApp } from '../helpers/testApp';
import { Application } from 'express';
import { mockAuthSuccess, mockAuthFailure } from '../helpers/authHelper';
import User from '../../models/user.model';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { Brand } from '../../models/brand.model';
import Coupon from '../../models/coupon.model';
import mongoose from 'mongoose';

describe('Client Integration', () => {
    let app: Application;

    beforeAll(() => {
        app = createTestApp();
    });

    describe('Shopper Journey', () => {
        let userUid = 'shopper-uid';
        let productId: string;

        beforeEach(async () => {
            await User.create({
                uid: userUid,
                email: 'shopper@test.com',
                name: 'Shopper',
                role: 'user',
                provider: 'google.com',
                gender: 'male',
                dob: new Date()
            });

            const cat = await Category.create({ name: 'Client Cat', value: 'client-cat' });
            const brand = await Brand.create({ name: 'Client Brand', image: 'url', imagePublicId: 'id' });

            const prod = await Product.create({
                name: 'Client Prod',
                price: 100,
                netPrice: 100,
                stock: 10,
                description: 'Great',
                photos: ['url'],
                photoPublicIds: ['id'],
                status: true,
                categories: [cat._id],
                brand: brand._id
            });
            productId = prod._id.toString();
        });

        it('should get product details', async () => {
            const res = await request(app).get(`/api/v1/client/products/${productId}`);
            expect(res.status).toBe(200);
            expect(res.body.product.name).toBe('Client Prod');
        });

        it('should fail checkout if unauthorized', async () => {
            const res = await request(app).post('/api/v1/client/orders/new');
            expect(res.status).toBe(401);
        });

        it('should handle checkout with valid coupon', async () => {
            const coupon = await Coupon.create({
                code: 'SAVE10',
                amount: 10,
                minOrderValue: 50,
                isActive: true
            });

            mockAuthSuccess(userUid);
            const res = await request(app)
                .post('/api/v1/client/orders/new')
                .set('Cookie', ['token=valid-token'])
                .send({
                    orderItems: [{ productId, quantity: 1, name: 'Prod', photo: 'url', price: 100 }],
                    shippingInfo: {
                        address: 'Addr', city: 'City', country: 'Country', phone: '1234567890'
                    },
                    subTotal: 100,
                    shippingCharges: 0,
                    tax: 0,
                    total: 90,
                    couponCode: 'SAVE10'
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);

            // Check stock was reduced
            const updatedProd = await Product.findById(productId);
            expect(updatedProd?.stock).toBe(9);

            // Check coupon was tracked
            const updatedCoupon = await Coupon.findById(coupon._id);
            expect(updatedCoupon?.usedCount).toBe(1);
        });

        it('should reject checkout if stock is insufficient', async () => {
            mockAuthSuccess(userUid);
            const res = await request(app)
                .post('/api/v1/client/orders/new')
                .set('Cookie', ['token=valid-token'])
                .send({
                    orderItems: [{ productId, quantity: 11, name: 'Prod', photo: 'url', price: 100 }],
                    shippingInfo: {
                        address: 'Addr', city: 'City', country: 'Country', phone: '1234567890'
                    },
                    subTotal: 1100,
                    shippingCharges: 0,
                    tax: 0,
                    total: 1100
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toContain('stock');
        });
    });
});
