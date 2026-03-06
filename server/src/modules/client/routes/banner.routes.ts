import express, { Request, Response, NextFunction } from 'express';
import {
    getAllBanners,
    getBannerById
} from '../controllers/banner.controller';
import { optionalAuth } from '../../../middleware/auth.middleware';

const router = express.Router();

const guardBannerInactive = (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (req.query.includeInactive === 'true' && user?.role !== 'admin') {
        delete req.query.includeInactive;
    }
    next();
};

// Client banners are mostly public
router.get('/', optionalAuth, guardBannerInactive, getAllBanners);
router.get('/:id', getBannerById);

export default router;
