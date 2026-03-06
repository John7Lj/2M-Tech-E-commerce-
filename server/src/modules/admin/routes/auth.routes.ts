import express from 'express';
import {
    getAllUsers,
    getUser,
    adminLogin,
    logoutAdmin,
    getMe
} from '../controllers/auth.controller';
import { authenticateUser, adminOnly } from '../../../middleware/auth.middleware';

const router = express.Router();

// Public admin routes
router.post('/login', adminLogin);
router.post('/logout', logoutAdmin);

// Protected admin auth routes
router.use(authenticateUser, adminOnly);

router.get('/all', getAllUsers);
router.get('/me', getMe);
router.get('/:id', getUser);

export default router;
