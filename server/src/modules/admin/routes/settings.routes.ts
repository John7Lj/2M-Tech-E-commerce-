import express from 'express';
import { updateSettings, getSettings } from '../controllers/settings.controller';
import { authenticateUser, adminOnly } from '../../../middleware/auth.middleware';
import { uploadImage } from '../../../utils/cloudinary';

const router = express.Router();

// Admin settings routes
router.get('/', authenticateUser, adminOnly, getSettings);
router.put('/', authenticateUser, adminOnly, uploadImage('logo'), updateSettings);

export default router;
