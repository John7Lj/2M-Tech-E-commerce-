/**
 * Model Validation Tests
 * Tests Mongoose schema validation for all models.
 */
import '../setup';
import User from '../../models/user.model';
import { Product } from '../../models/product.model';
import Order from '../../models/order.model';
import Coupon from '../../models/coupon.model';
import { Category } from '../../models/category.model';
import { Brand } from '../../models/brand.model';
import ShippingTier from '../../models/shippingTier.model';

// ─── User Model ───────────────────────────────────────────────
describe('User Model', () => {
    const validUser = {
        uid: 'firebase-uid-123',
        email: 'test@example.com',
        name: 'Test User',
        provider: 'google.com',
        gender: 'male',
        dob: new Date('2000-01-01'),
    };

    it('should create a valid user', async () => {
        const user = await User.create(validUser);
        expect(user._id).toBeDefined();
        expect(user.name).toBe('Test User');
        expect(user.role).toBe('user'); // default role
    });

    it('should have timestamps', async () => {
        const user = await User.create(validUser);
        expect((user as any).createdAt).toBeDefined();
        expect((user as any).updatedAt).toBeDefined();
    });

    it('should reject missing required fields', async () => {
        await expect(User.create({ uid: '123' })).rejects.toThrow();
    });

    it('should reject invalid role', async () => {
        await expect(
            User.create({ ...validUser, role: 'superadmin' })
        ).rejects.toThrow();
    });

    it('should reject invalid gender', async () => {
        await expect(
            User.create({ ...validUser, gender: 'potato' })
        ).rejects.toThrow();
    });

    it('should accept admin role', async () => {
        const user = await User.create({ ...validUser, role: 'admin' });
        expect(user.role).toBe('admin');
    });

    it('should enforce unique uid', async () => {
        await User.create(validUser);
        await expect(User.create(validUser)).rejects.toThrow();
    });

    it('should enforce unique email', async () => {
        await User.create(validUser);
        await expect(
            User.create({ ...validUser, uid: 'different-uid' })
        ).rejects.toThrow();
    });
});

// ─── Product Model ────────────────────────────────────────────
describe('Product Model', () => {
    let categoryId: string;
    let brandId: string;

    beforeEach(async () => {
        const category = await Category.create({ name: 'Electronics', value: 'electronics' });
        const brand = await Brand.create({ name: 'TestBrand', image: 'http://img.com/brand.png', imagePublicId: 'brand-123' });
        categoryId = category._id.toString();
        brandId = brand._id.toString();
    });

    const getValidProduct = (catId: string, brId: string) => ({
        name: 'Test Product',
        price: 100,
        netPrice: 90,
        stock: 10,
        categories: [catId],
        brand: brId,
        description: 'A test product',
        photos: ['http://img.com/1.jpg'],
        photoPublicIds: ['photo-1'],
    });

    it('should create a valid product', async () => {
        const product = await Product.create(getValidProduct(categoryId, brandId));
        expect(product._id).toBeDefined();
        expect(product.status).toBe(true); // default published
        expect(product.featured).toBe(false);
        expect(product.discount).toBe(0);
    });

    it('should reject negative discount', async () => {
        await expect(
            Product.create({ ...getValidProduct(categoryId, brandId), discount: -10 })
        ).rejects.toThrow();
    });

    it('should reject discount > 100', async () => {
        await expect(
            Product.create({ ...getValidProduct(categoryId, brandId), discount: 150 })
        ).rejects.toThrow();
    });

    it('should recalculate netPrice on save', async () => {
        const product = new Product({ ...getValidProduct(categoryId, brandId), price: 200, discount: 25 });
        await product.save();
        expect(product.netPrice).toBe(150); // 200 - (200*25/100)
    });

    it('should reject missing name', async () => {
        const data = getValidProduct(categoryId, brandId);
        delete (data as any).name;
        await expect(Product.create(data)).rejects.toThrow();
    });

    it('should reject missing price', async () => {
        const data = getValidProduct(categoryId, brandId);
        delete (data as any).price;
        await expect(Product.create(data)).rejects.toThrow();
    });
});

// ─── Order Model ──────────────────────────────────────────────
describe('Order Model', () => {
    it('should create a valid order with state field', async () => {
        const user = await User.create({
            uid: 'order-user-1', email: 'order@test.com', name: 'Order User',
            provider: 'google.com', gender: 'male', dob: new Date('1995-01-01'),
        });

        const order = await Order.create({
            shippingInfo: {
                address: '123 Main St',
                city: 'Cairo',
                state: 'Cairo Governorate',
                phone: '+201234567890',
                country: 'Egypt',
            },
            user: user._id,
            subtotal: 100,
            tax: 10,
            shippingCharges: 5,
            total: 115,
            orderItems: [{
                name: 'Test Product',
                photo: 'http://img.com/1.jpg',
                price: 100,
                quantity: 1,
                productId: '507f1f77bcf86cd799439011',
            }],
        });

        expect(order._id).toBeDefined();
        expect(order.shippingInfo.state).toBe('Cairo Governorate');
        expect(order.status).toBe('Pending'); // default
    });

    it('should reject invalid status', async () => {
        // Status enum should only allow: Pending, Processing, Shipped, Delivered
        const user = await User.create({
            uid: 'order-user-2', email: 'order2@test.com', name: 'Order User 2',
            provider: 'google.com', gender: 'female', dob: new Date('1995-01-01'),
        });

        await expect(Order.create({
            shippingInfo: { address: '123', city: 'X', phone: '123', country: 'Y' },
            user: user._id,
            subtotal: 100,
            tax: 10,
            shippingCharges: 5,
            total: 115,
            status: 'InvalidStatus',
            orderItems: [],
        })).rejects.toThrow();
    });

    it('should default state to empty string when not provided', async () => {
        const user = await User.create({
            uid: 'order-user-3', email: 'order3@test.com', name: 'Order User 3',
            provider: 'google.com', gender: 'male', dob: new Date('1995-01-01'),
        });

        const order = await Order.create({
            shippingInfo: { address: '123', city: 'X', phone: '123', country: 'Y' },
            user: user._id,
            subtotal: 50,
            tax: 5,
            shippingCharges: 10,
            total: 65,
            orderItems: [],
        });

        expect(order.shippingInfo.state).toBe('');
    });
});

// ─── Coupon Model ─────────────────────────────────────────────
describe('Coupon Model', () => {
    it('should create a valid coupon', async () => {
        const coupon = await Coupon.create({
            code: 'SAVE10',
            amount: 10,
        });
        expect(coupon.code).toBe('SAVE10');
        expect(coupon.usedCount).toBe(0);
        expect(coupon.maxUses).toBeNull();
    });

    it('should reject amount < 1', async () => {
        await expect(Coupon.create({ code: 'BAD', amount: 0 })).rejects.toThrow();
    });

    it('should enforce unique code', async () => {
        await Coupon.create({ code: 'UNIQUE1', amount: 5 });
        await expect(Coupon.create({ code: 'UNIQUE1', amount: 10 })).rejects.toThrow();
    });
});

// ─── ShippingTier Model ───────────────────────────────────────
describe('ShippingTier Model', () => {
    it('should create a valid shipping tier', async () => {
        const tier = await ShippingTier.create({
            minOrderValue: 0,
            maxOrderValue: 100,
            shippingCost: 15,
        });
        expect(tier.isActive).toBe(true); // default
        expect(tier.shippingCost).toBe(15);
    });
});
