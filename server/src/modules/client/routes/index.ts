import express from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import orderRoutes from './order.routes';
import couponRoutes from './coupon.routes';
import bannerRoutes from './banner.routes';
import brandRoutes from './brand.routes';
import categoryRoutes from './category.routes';
import subcategoryRoutes from './subcategory.routes';
import currencyRoutes from './currency.routes';
import pageRoutes from './page.routes';
import settingsRoutes from './settings.routes';
import shippingTierRoutes from './shippingTier.routes';
import telegramRoutes from './telegram.routes';
import paymentRoutes from './payment.routes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/coupons', couponRoutes);
router.use('/banners', bannerRoutes);
router.use('/brands', brandRoutes);
router.use('/categories', categoryRoutes);
router.use('/subcategories', subcategoryRoutes);
router.use('/currencies', currencyRoutes);
router.use('/pages', pageRoutes);
router.use('/settings', settingsRoutes);
router.use('/shipping-tiers', shippingTierRoutes);
router.use('/telegram', telegramRoutes);
router.use('/payment', paymentRoutes);

export default router;
