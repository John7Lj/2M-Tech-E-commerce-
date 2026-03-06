import express from 'express';
import {
    setupTelegramWebhook,
    deleteTelegramWebhook,
    testGroupForwarding,
    getTelegramWebhookInfo
} from '../controllers/telegram.controller';
import { adminOnly, authenticateUser } from '../../../middleware/auth.middleware';

const router = express.Router();

// All admin telegram routes are protected
router.use(authenticateUser, adminOnly);

router.post('/setup-webhook', setupTelegramWebhook);
router.delete('/webhook', deleteTelegramWebhook);
router.get('/webhook-info', getTelegramWebhookInfo);
router.post('/test-forwarding', testGroupForwarding);

export default router;
