import express from 'express';
import {
    handleTelegramWebhook
} from '../controllers/telegram.controller';

const router = express.Router();

// Public webhook endpoint
router.post('/webhook', handleTelegramWebhook);

export default router;
