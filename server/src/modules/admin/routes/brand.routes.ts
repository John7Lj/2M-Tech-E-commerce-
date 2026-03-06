import express from 'express';
import {
    createBrand,
    deleteBrand,
    updateBrand,
    getAllBrands,
    getBrandsForDropdown,
    getBrandById
} from '../controllers/brand.controller';
import { adminOnly, authenticateUser } from '../../../middleware/auth.middleware';
import { uploadImage } from '../../../utils/cloudinary';

const router = express.Router();

// All admin brand routes are protected
router.use(authenticateUser, adminOnly);

router.get('/all', getAllBrands);
router.get('/dropdown', getBrandsForDropdown);
router.get('/:id', getBrandById);
router.post('/new', uploadImage('image'), createBrand);
router.put('/:id', uploadImage('image'), updateBrand);
router.delete('/:id', deleteBrand);

export default router;
