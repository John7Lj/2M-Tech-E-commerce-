import express from 'express';
import {
    createBanner,
    updateBanner,
    deleteBanner,
    toggleBannerStatus,
    getAllBanners,
    getBannerById
} from '../controllers/banner.controller';
import { uploadImage } from '../../../utils/cloudinary';
import { adminOnly, authenticateUser } from '../../../middleware/auth.middleware';

const router = express.Router();

// All admin banner routes are protected
router.use(authenticateUser, adminOnly);

router.get('/all', getAllBanners); // Admin can get with includeInactive
router.get('/:id', getBannerById);
router.post('/new', uploadImage('image'), createBanner);
router.put('/:id', uploadImage('image'), updateBanner);
router.delete('/:id', deleteBanner);
router.patch('/toggle/:id', toggleBannerStatus);

export default router;
