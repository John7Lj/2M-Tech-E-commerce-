import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { telegramService } from "../../../services/telegram.service";
import { ApiError } from "../../../utils/ApiError";

export const setupTelegramWebhook = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { webhookUrl } = req.body;

    if (!webhookUrl) {
        return next(new ApiError(400, 'Webhook URL is required'));
    }

    const result = await telegramService.setupWebhook(webhookUrl);

    if (result.success) {
        res.status(200).json({
            success: true,
            message: 'Webhook set up successfully',
            data: result.data
        });
    } else {
        return next(new ApiError(500, `Failed to setup webhook: ${result.error}`));
    }
});

export const deleteTelegramWebhook = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const result = await telegramService.deleteWebhook();

    if (result.success) {
        res.status(200).json({
            success: true,
            message: 'Webhook deleted successfully',
            data: result.data
        });
    } else {
        return next(new ApiError(500, `Failed to delete webhook: ${result.error}`));
    }
});

export const testGroupForwarding = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const mockMessageData = {
        message: {
            message_id: 999999,
            from: {
                id: 123456789,
                first_name: "Test",
                last_name: "User",
                username: "testuser"
            },
            chat: {
                id: 123456789,
                type: "private"
            },
            date: Math.floor(Date.now() / 1000),
            text: "This is a test message to verify group forwarding functionality!"
        }
    };

    const result = await telegramService.forwardMessageToGroup(mockMessageData);

    if (result) {
        res.status(200).json({
            success: true,
            message: 'Test message forwarded to group successfully'
        });
    } else {
        res.status(500).json({
            success: false,
            message: 'Failed to forward test message to group'
        });
    }
});

export const getTelegramWebhookInfo = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const result = await telegramService.getWebhookInfo();

    if (result) {
        res.status(200).json({
            success: true,
            data: result
        });
    } else {
        return next(new ApiError(500, 'Failed to get webhook info'));
    }
});
