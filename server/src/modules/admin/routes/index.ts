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
import statsRoutes from './stats.routes';
import telegramRoutes from './telegram.routes';

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
router.use('/stats', statsRoutes);
router.use('/telegram', telegramRoutes);

export default router;
