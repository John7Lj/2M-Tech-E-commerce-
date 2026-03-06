import express from 'express';
import {
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
    permanentDeleteSubcategory,
    getAllSubcategories,
    getSubcategoriesByCategory,
    getSubcategory
} from '../controllers/subcategory.controller';
import { uploadImage } from '../../../utils/cloudinary';
import { adminOnly, authenticateUser } from '../../../middleware/auth.middleware';

const router = express.Router();

// All admin subcategory routes are protected
router.use(authenticateUser, adminOnly);

router.get('/all', getAllSubcategories);
router.get('/category/:categoryId', getSubcategoriesByCategory);
router.get('/:id', getSubcategory);
router.post('/new', uploadImage('image'), createSubcategory);
router.put('/:id', uploadImage('image'), updateSubcategory);
router.delete('/:id', deleteSubcategory);
router.delete('/permanent/:id', permanentDeleteSubcategory);

export default router;
