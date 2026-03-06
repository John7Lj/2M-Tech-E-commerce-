import { Router } from 'express';
import {
    getAllCategories,
    getCategory
} from '../controllers/category.controller';

const router = Router();

// Client category routes are public
router.get('/', getAllCategories);
router.get('/:id', getCategory);

export default router;
