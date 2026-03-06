import express from 'express';
import {
    getAllSubcategories,
    getSubcategoriesByCategory,
    getSubcategory
} from '../controllers/subcategory.controller';

const router = express.Router();

// Client subcategory routes are public
router.get('/all', getAllSubcategories);
router.get('/category/:categoryId', getSubcategoriesByCategory);
router.get('/:id', getSubcategory);

export default router;
