import express from 'express';
import {
    login,
    signup,
    getMe,
    updateProfile,
    logoutUser
} from '../controllers/auth.controller';
import { authenticateUser, optionalAuth } from '../../../middleware/auth.middleware';
import { uploadImage } from '../../../utils/cloudinary';

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/signup', signup);

// Protected routes
router.get('/me', authenticateUser, getMe);
router.put('/update-profile', authenticateUser, uploadImage('photo'), updateProfile);
router.post('/logout', optionalAuth, logoutUser);

export default router;
