import express from 'express';
import {
    getAllPages,
    createPage,
    updatePage,
    deletePage
} from '../controllers/page.controller';
import { adminOnly, authenticateUser } from '../../../middleware/auth.middleware';

const router = express.Router();

// All admin page routes are protected
router.use(authenticateUser, adminOnly);

router.get('/', getAllPages);
router.post('/', createPage);
router.put('/:id', updatePage);
router.delete('/:id', deletePage);

export default router;
