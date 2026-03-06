import express, { Request, Response, NextFunction } from 'express';
import {
    getAllCategories,
    getAllProducts,
    getFeaturedProducts,
    getLatestProducts,
    getProductDetails,
    searchProducts,
    getProductsByCategory,
    getProductsByBrand,
    getProductsBySubcategory
} from '../controllers/product.controller';
import { optionalAuth } from '../../../middleware/auth.middleware';

const router = express.Router();

/**
 * Strip `includeUnpublished` from the query for any non-admin caller.
 * Admins must be authenticated and have role === 'admin'.
 */
const guardUnpublished = (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (req.query.includeUnpublished === 'true' && user?.role !== 'admin') {
        delete req.query.includeUnpublished;
    }
    next();
};

// Client products are mostly public with optionalAuth for admin previewing unpublished
router.get('/all', optionalAuth, guardUnpublished, getAllProducts);
router.get('/featured', optionalAuth, guardUnpublished, getFeaturedProducts);
router.get('/latest', optionalAuth, guardUnpublished, getLatestProducts);
router.get('/categories', getAllCategories);
router.get('/search', optionalAuth, guardUnpublished, searchProducts);
router.get('/category/:categoryId', optionalAuth, guardUnpublished, getProductsByCategory);
router.get('/brand/:brandId', optionalAuth, guardUnpublished, getProductsByBrand);
router.get('/subcategory/:subcategoryId', optionalAuth, guardUnpublished, getProductsBySubcategory);
router.get('/:id', getProductDetails);

export default router;
