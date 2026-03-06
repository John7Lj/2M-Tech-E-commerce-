import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { telegramService } from "../../../services/telegram.service";

export const handleTelegramWebhook = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (secretToken && req.headers['x-telegram-bot-api-secret-token'] !== secretToken) {
        return res.status(403).json({ ok: false });
    }

    try {
        const update = req.body;

        if (update.message) {
            await telegramService.forwardMessageToGroup(update);
        }

        res.status(200).json({ ok: true });
    } catch (error: any) {
        res.status(200).json({ ok: true });
    }
});
