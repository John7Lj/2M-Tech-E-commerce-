import express from 'express';
import {
    getAllBrands,
    getBrandById,
    getBrandsForDropdown
} from '../controllers/brand.controller';

const router = express.Router();

// Client brand routes are public
router.get('/all', getAllBrands);
router.get('/dropdown', getBrandsForDropdown);
router.get('/:id', getBrandById);

export default router;
