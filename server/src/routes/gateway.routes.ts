import express from 'express';
import adminRoutes from '../modules/admin/routes';
import clientRoutes from '../modules/client/routes';

const router = express.Router();

router.use('/admin', adminRoutes);
router.use('/client', clientRoutes);

// Catch-all for unknown routes within the gateway
router.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found',
    });
});

export default router;
