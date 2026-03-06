/**
 * Order Controller Tests
 * Tests newOrder, updateOrderStatus, deleteOrder, getAllOrders, getOrder
 */
import '../setup';
import User from '../../models/user.model';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { Brand } from '../../models/brand.model';
import Order from '../../models/order.model';
import Coupon from '../../models/coupon.model';
import { newOrder, updateOrderStatus, deleteOrder, getAllOrders, getOrder } from '../../controllers/order.controller';
import { Request, Response, NextFunction } from 'express';

let userId: string;
let productId: string;
let categoryId: string;
let brandId: string;

const mockReq = (body = {}, params = {}, user: any = null): any => ({
    body, params, user,
});

const mockRes = (): any => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

// Mock telegramService to avoid real API calls
jest.mock('../../services/telegram.service', () => ({
    telegramService: {
        isConfigured: jest.fn().mockReturnValue(false),
        sendOrderNotification: jest.fn(),
        sendStatusUpdateNotification: jest.fn(),
    },
}));

describe('Order Controller', () => {
    beforeEach(async () => {
        const cat = await Category.create({ name: 'Electronics', value: 'electronics' });
        const brand = await Brand.create({ name: 'Samsung', image: 'img', imagePublicId: 'id' });
        categoryId = cat._id.toString();
        brandId = brand._id.toString();

        const user = await User.create({
            uid: 'order-uid-1', email: 'order@test.com', name: 'Order User',
            provider: 'google.com', gender: 'male', dob: new Date('2000-01-01'),
        });
        userId = user._id.toString();

        const product = await Product.create({
            name: 'Test Phone', price: 500, netPrice: 500, stock: 10,
            categories: [categoryId], brand: brandId,
            description: 'A phone', photos: ['img.jpg'], photoPublicIds: ['ph1'],
        });
        productId = product._id.toString();
    });

    // ─── newOrder ─────────────────────────────────────────────
    describe('newOrder', () => {
        const validOrderBody = () => ({
            orderItems: [{ productId, photo: 'img.jpg', name: 'Test Phone', price: 500, quantity: 1 }],
            shippingInfo: { address: '123 St', city: 'Cairo', state: 'Cairo', phone: '0123456789', country: 'Egypt' },
            subTotal: 500,
            tax: 50,
            shippingCharges: 15,
            discount: 0,
            total: 565,
        });

        it('should reject empty order items', async () => {
            const req = mockReq({ ...validOrderBody(), orderItems: [] }, {}, { _id: userId });
            const res = mockRes();
            const next = jest.fn();
            await newOrder(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0].statusCode).toBe(400);
        });

        it('should reject missing shipping info', async () => {
            const req = mockReq({ ...validOrderBody(), shippingInfo: null }, {}, { _id: userId });
            const res = mockRes();
            const next = jest.fn();
            await newOrder(req, res, next);
            expect(next).toHaveBeenCalled();
        });

        it('should reject unauthenticated user', async () => {
            const req = mockReq(validOrderBody(), {}, null);
            const res = mockRes();
            const next = jest.fn();
            await newOrder(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0].statusCode).toBe(401);
        });

        it('should create order with valid data', async () => {
            const req = mockReq(validOrderBody(), {}, { _id: userId });
            const res = mockRes();
            const next = jest.fn();
            await newOrder(req, res, next);
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            const data = res.json.mock.calls[0][0];
            expect(data.success).toBe(true);
            expect(data.orderId).toBeDefined();

            // Verify stock was reduced
            const product = await Product.findById(productId);
            expect(product!.stock).toBe(9);
        });

        it('should reject tampered total', async () => {
            const body = validOrderBody();
            body.total = 100; // much less than actual
            const req = mockReq(body, {}, { _id: userId });
            const res = mockRes();
            const next = jest.fn();
            await newOrder(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0].message).toContain('total');
        });

        it('should re-validate coupon server-side', async () => {
            await Coupon.create({ code: 'ORDERSAVE', amount: 50 });
            const body = {
                ...validOrderBody(),
                couponCode: 'ORDERSAVE',
                discount: 50,
                total: 515, // 500 + 50 + 15 - 50
            };
            const req = mockReq(body, {}, { _id: userId });
            const res = mockRes();
            const next = jest.fn();
            await newOrder(req, res, next);
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should reject invalid coupon code', async () => {
            const body = {
                ...validOrderBody(),
                couponCode: 'FAKECOUPON',
                discount: 50,
                total: 515,
            };
            const req = mockReq(body, {}, { _id: userId });
            const res = mockRes();
            const next = jest.fn();
            await newOrder(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0].message).toContain('valid');
        });

        it('should reject non-existent product', async () => {
            const body = validOrderBody();
            body.orderItems = [{ productId: '507f1f77bcf86cd799439011', photo: 'x', name: 'X', price: 500, quantity: 1 }];
            const req = mockReq(body, {}, { _id: userId });
            const res = mockRes();
            const next = jest.fn();
            await newOrder(req, res, next);
            expect(next).toHaveBeenCalled();
        });

        it('should reject when stock is insufficient', async () => {
            await Product.findByIdAndUpdate(productId, { stock: 0 });
            const req = mockReq(validOrderBody(), {}, { _id: userId });
            const res = mockRes();
            const next = jest.fn();
            await newOrder(req, res, next);
            expect(next).toHaveBeenCalled();
        });
    });

    // ─── updateOrderStatus ────────────────────────────────────
    describe('updateOrderStatus', () => {
        it('should update status forward', async () => {
            const order = await Order.create({
                shippingInfo: { address: 'X', city: 'Y', phone: '0123456789', country: 'Z' },
                user: userId, subtotal: 100, tax: 10, shippingCharges: 5, total: 115,
                orderItems: [{ name: 'P', photo: 'img', price: 100, quantity: 1, productId }],
                status: 'Pending',
            });
            const req = mockReq({ status: 'Processing' }, { id: order._id.toString() });
            const res = mockRes();
            const next = jest.fn();
            await updateOrderStatus(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            const updated = await Order.findById(order._id);
            expect(updated!.status).toBe('Processing');
        });

        it('should reject backward status change', async () => {
            const order = await Order.create({
                shippingInfo: { address: 'X', city: 'Y', phone: '0123456789', country: 'Z' },
                user: userId, subtotal: 100, tax: 10, shippingCharges: 5, total: 115,
                orderItems: [], status: 'Shipped',
            });
            const req = mockReq({ status: 'Pending' }, { id: order._id.toString() });
            const res = mockRes();
            const next = jest.fn();
            await updateOrderStatus(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0].message).toContain('back to');
        });

        it('should reject missing status', async () => {
            const req = mockReq({}, { id: '507f1f77bcf86cd799439011' });
            const res = mockRes();
            const next = jest.fn();
            await updateOrderStatus(req, res, next);
            expect(next).toHaveBeenCalled();
        });

        it('should reject invalid status value', async () => {
            const req = mockReq({ status: 'unknown' }, { id: '507f1f77bcf86cd799439011' });
            const res = mockRes();
            const next = jest.fn();
            await updateOrderStatus(req, res, next);
            expect(next).toHaveBeenCalled();
        });
    });

    // ─── deleteOrder ──────────────────────────────────────────
    describe('deleteOrder', () => {
        it('should delete order and restore stock', async () => {
            const order = await Order.create({
                shippingInfo: { address: 'X', city: 'Y', phone: '0123456789', country: 'Z' },
                user: userId, subtotal: 500, tax: 50, shippingCharges: 15, total: 565,
                orderItems: [{ name: 'P', photo: 'img', price: 500, quantity: 2, productId }],
            });
            // Manually reduce stock
            await Product.findByIdAndUpdate(productId, { $inc: { stock: -2 } });

            const req = mockReq({}, { id: order._id.toString() });
            const res = mockRes();
            const next = jest.fn();
            await deleteOrder(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);

            // Stock should be restored
            const product = await Product.findById(productId);
            expect(product!.stock).toBe(10);

            // Order should be deleted
            const deleted = await Order.findById(order._id);
            expect(deleted).toBeNull();
        });

        it('should return 404 for non-existent order', async () => {
            const req = mockReq({}, { id: '507f1f77bcf86cd799439011' });
            const res = mockRes();
            const next = jest.fn();
            await deleteOrder(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0].statusCode).toBe(404);
        });
    });

    // ─── getAllOrders ──────────────────────────────────────────
    describe('getAllOrders', () => {
        it('should return all orders with populated user', async () => {
            await Order.create({
                shippingInfo: { address: 'X', city: 'Y', phone: '0123456789', country: 'Z' },
                user: userId, subtotal: 100, tax: 10, shippingCharges: 5, total: 115,
                orderItems: [],
            });
            const req = mockReq();
            const res = mockRes();
            const next = jest.fn();
            await getAllOrders(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            const data = res.json.mock.calls[0][0];
            expect(data.orders).toHaveLength(1);
        });
    });

    // ─── getOrder ─────────────────────────────────────────────
    describe('getOrder', () => {
        it('should allow owner to view their order', async () => {
            const order = await Order.create({
                shippingInfo: { address: 'X', city: 'Y', phone: '0123456789', country: 'Z' },
                user: userId, subtotal: 100, tax: 10, shippingCharges: 5, total: 115,
                orderItems: [],
            });
            const req = mockReq({}, { id: order._id.toString() }, { _id: userId, role: 'user' });
            const res = mockRes();
            const next = jest.fn();
            await getOrder(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should allow admin to view any order', async () => {
            const order = await Order.create({
                shippingInfo: { address: 'X', city: 'Y', phone: '0123456789', country: 'Z' },
                user: userId, subtotal: 100, tax: 10, shippingCharges: 5, total: 115,
                orderItems: [],
            });
            const req = mockReq({}, { id: order._id.toString() }, { _id: 'different-admin-id', role: 'admin' });
            const res = mockRes();
            const next = jest.fn();
            await getOrder(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should reject non-owner non-admin from viewing order', async () => {
            const order = await Order.create({
                shippingInfo: { address: 'X', city: 'Y', phone: '0123456789', country: 'Z' },
                user: userId, subtotal: 100, tax: 10, shippingCharges: 5, total: 115,
                orderItems: [],
            });
            const req = mockReq({}, { id: order._id.toString() }, { _id: 'other-user-id', role: 'user' });
            const res = mockRes();
            const next = jest.fn();
            await getOrder(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0].statusCode).toBe(403);
        });

        it('should return 404 for non-existent order', async () => {
            const req = mockReq({}, { id: '507f1f77bcf86cd799439011' }, { _id: userId, role: 'admin' });
            const res = mockRes();
            const next = jest.fn();
            await getOrder(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0].statusCode).toBe(404);
        });
    });
});
