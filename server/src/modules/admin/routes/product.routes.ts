import express from 'express';
import {
    createNewProduct,
    deleteProduct,
    toggleFeaturedStatus,
    togglePublishedStatus,
    updateProduct,
    getAllProducts,
    getProductDetails,
    getLatestProducts,
    searchProducts,
    getProductsByCategory,
    getProductsByBrand,
    getProductsBySubcategory
} from '../controllers/product.controller';
import { uploadMultipleImages } from '../../../utils/cloudinary';
import { adminOnly, authenticateUser } from '../../../middleware/auth.middleware';

const router = express.Router();

// All admin product routes are protected
router.use(authenticateUser, adminOnly);

router.get('/all', getAllProducts);
router.get('/latest', getLatestProducts);
router.get('/search', searchProducts);
router.get('/category/:categoryId', getProductsByCategory);
router.get('/brand/:brandId', getProductsByBrand);
router.get('/subcategory/:subcategoryId', getProductsBySubcategory);
router.get('/:id', getProductDetails);
router.post('/new', uploadMultipleImages('photos', 10), createNewProduct);
router.put('/:id', uploadMultipleImages('photos', 10), updateProduct);
router.delete('/:id', deleteProduct);
router.patch('/feature/:id', toggleFeaturedStatus);
router.patch('/publish/:id', togglePublishedStatus);

export default router;
