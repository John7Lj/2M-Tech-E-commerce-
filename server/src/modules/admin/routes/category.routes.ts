import { Router } from 'express';
import {
    createCategory,
    getAllCategoriesAdmin,
    updateCategory,
    deleteCategory,
    permanentDeleteCategory,
    getCategory
} from '../controllers/category.controller';
import { authenticateUser, adminOnly } from '../../../middleware/auth.middleware';
import { uploadImage } from '../../../utils/cloudinary';

const router = Router();

// All admin category routes are protected
router.use(authenticateUser, adminOnly);

router.get('/', getAllCategoriesAdmin);
router.get('/admin/all', getAllCategoriesAdmin);
router.get('/:id', getCategory);
router.post('/', uploadImage('image'), createCategory);
router.put('/:id', uploadImage('image'), updateCategory);
router.delete('/:id', deleteCategory);
router.delete('/permanent/:id', permanentDeleteCategory);

export default router;
