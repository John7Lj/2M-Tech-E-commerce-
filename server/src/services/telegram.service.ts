// server/src/services/telegram.service.ts
import axios from 'axios';
import winston from 'winston';
import { OrderItemType, ShippingInfoType } from '../types/types';

interface OrderNotificationData {
    orderId: string;
    orderItems: OrderItemType[];
    shippingInfo: ShippingInfoType;
    total: number;
    subtotal: number;
    tax: number;
    shippingCharges: number;
    discount: number;
    customerEmail: string;
    customerName: string;
}

class TelegramService {
    private botToken: string;
    private chatId: string;
    private apiUrl: string;

    constructor() {
        this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
        this.chatId = process.env.TELEGRAM_CHAT_ID || '';
        this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
    }

    isConfigured(): boolean {
        return !!(this.botToken && this.chatId);
    }

    // Send a message to the group
    async sendMessage(text: string, parseMode: 'HTML' | 'Markdown' = 'HTML'): Promise<boolean> {
        if (!this.isConfigured()) return false;

        try {
            const response = await axios.post(`${this.apiUrl}/sendMessage`, {
                chat_id: this.chatId,
                text: text,
                parse_mode: parseMode,
                disable_web_page_preview: true
            });
            return !!response.data.ok;
        } catch (error: any) {
            winston.error('Failed to send Telegram message', { error: error.message });
            return false;
        }
    }

    // Get webhook info — keeps bot token encapsulated in the service
    async getWebhookInfo(): Promise<any | null> {
        if (!this.isConfigured()) return null;
        try {
            const response = await axios.get(`${this.apiUrl}/getWebhookInfo`);
            return response.data.ok ? response.data.result : null;
        } catch (error: any) {
            winston.error('Failed to get Telegram webhook info', { error: error.message });
            return null;
        }
    }

    // Send order notification to the group
    async sendOrderNotification(data: OrderNotificationData): Promise<boolean> {
        const orderItemsList = data.orderItems
            .map((item, index) =>
                `${index + 1}. <b>${item.name}</b>\n   Qty: ${item.quantity} × $${item.price.toFixed(2)} = $${(item.quantity * item.price).toFixed(2)}`
            )
            .join('\n\n');

        const message = `
🛒 <b>NEW ORDER RECEIVED!</b>

📋 <b>Order ID:</b> <code>${data.orderId}</code>

👤 <b>Customer Details:</b>
• Name: ${data.customerName}
• Email: ${data.customerEmail}

📦 <b>Items Ordered:</b>
${orderItemsList}

📍 <b>Shipping Address:</b>
${data.shippingInfo.address}
${data.shippingInfo.city}, ${data.shippingInfo.state}
${data.shippingInfo.country}
📞 ${data.shippingInfo.phone}

💰 <b>Order Summary:</b>
• Subtotal: $${data.subtotal.toFixed(2)}
• Tax: $${data.tax.toFixed(2)}
• Shipping: $${data.shippingCharges.toFixed(2)}
• Discount: -$${data.discount.toFixed(2)}
• <b>Total: $${data.total.toFixed(2)}</b>

⏰ Order Time: ${new Date().toLocaleString()}

#NewOrder #Order${data.orderId.replace(/[^a-zA-Z0-9]/g, '')}
        `.trim();

        return await this.sendMessage(message);
    }

    // Send order status update to the group
    async sendOrderStatusUpdate(orderId: string, status: string, customerName: string): Promise<boolean> {
        const statusEmoji = {
            'Pending': '⏳',
            'Processing': '🔄',
            'Shipped': '🚚',
            'Delivered': '✅'
        }[status] || '📋';

        const message = `
${statusEmoji} <b>ORDER STATUS UPDATE</b>

📋 <b>Order ID:</b> <code>${orderId}</code>
👤 <b>Customer:</b> ${customerName}
📊 <b>New Status:</b> <b>${status}</b>

⏰ Updated: ${new Date().toLocaleString()}

#OrderUpdate #Order${orderId.replace(/[^a-zA-Z0-9]/g, '')}
        `.trim();

        return await this.sendMessage(message);
    }

    // Forward messages from private chat to group
    async forwardMessageToGroup(update: any): Promise<boolean> {
        if (!update.message) return false;

        const message = update.message;
        const from = message.from;

        try {
            let forwardedMessage = '';

            const userName = from.username ? `@${from.username}` : `${from.first_name || 'Unknown'} ${from.last_name || ''}`.trim();
            forwardedMessage += `💬 <b>Message from customer:</b> ${userName}\n`;
            forwardedMessage += `👤 <b>User ID:</b> <code>${from.id}</code>\n\n`;

            if (message.text) {
                forwardedMessage += `📝 <b>Message:</b>\n${message.text}`;
            } else if (message.photo) {
                forwardedMessage += `📸 <b>Photo message</b>`;
                if (message.caption) {
                    forwardedMessage += `\n📝 <b>Caption:</b> ${message.caption}`;
                }
            } else if (message.document) {
                forwardedMessage += `📄 <b>Document:</b> ${message.document.file_name || 'Unknown file'}`;
                if (message.caption) {
                    forwardedMessage += `\n📝 <b>Caption:</b> ${message.caption}`;
                }
            } else if (message.contact) {
                forwardedMessage += `👤 <b>Contact shared:</b> ${message.contact.first_name} ${message.contact.last_name || ''}`;
                if (message.contact.phone_number) {
                    forwardedMessage += `\n📞 ${message.contact.phone_number}`;
                }
            } else {
                forwardedMessage += `📨 <b>Media message received</b>`;
            }

            forwardedMessage += `\n\n⏰ ${new Date().toLocaleString()}`;

            const success = await this.sendMessage(forwardedMessage);

            if (success && (message.photo || message.document || message.voice || message.video)) {
                try {
                    await axios.post(`${this.apiUrl}/forwardMessage`, {
                        chat_id: this.chatId,
                        from_chat_id: message.chat.id,
                        message_id: message.message_id
                    });
                } catch {
                    // Media forward failed but text was sent — acceptable
                }
            }

            return success;
        } catch (error: any) {
            winston.error('Failed to forward message to group', { error: error.message });
            return false;
        }
    }

    // Setup webhook
    async setupWebhook(webhookUrl: string): Promise<{ success: boolean, data?: any, error?: string }> {
        try {
            const response = await axios.post(`${this.apiUrl}/setWebhook`, {
                url: webhookUrl,
                drop_pending_updates: true
            });
            if (response.data.ok) {
                return { success: true, data: response.data.result };
            }
            return { success: false, error: response.data.description };
        } catch (error: any) {
            winston.error('Webhook setup error', { error: error.message });
            return { success: false, error: error.message };
        }
    }

    // Delete webhook
    async deleteWebhook(): Promise<{ success: boolean, data?: any, error?: string }> {
        try {
            const response = await axios.post(`${this.apiUrl}/deleteWebhook`, {
                drop_pending_updates: true
            });
            if (response.data.ok) {
                return { success: true, data: response.data.result };
            }
            return { success: false, error: response.data.description };
        } catch (error: any) {
            winston.error('Webhook deletion error', { error: error.message });
            return { success: false, error: error.message };
        }
    }

    // Test bot connection
    async testConnection(): Promise<boolean> {
        try {
            const response = await axios.get(`${this.apiUrl}/getMe`);
            return !!response.data.ok;
        } catch (error: any) {
            winston.error('Bot connection test error', { error: error.message });
            return false;
        }
    }

    // Get updates
    async getUpdates(): Promise<any> {
        try {
            const response = await axios.get(`${this.apiUrl}/getUpdates`);
            return response.data.ok ? response.data.result : null;
        } catch (error: any) {
            winston.error('Get updates error', { error: error.message });
            return null;
        }
    }

    // Test send to a specific chat
    async testSendToChat(chatId: string, message: string = 'Test message from bot 🤖'): Promise<boolean> {
        try {
            const response = await axios.post(`${this.apiUrl}/sendMessage`, {
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML'
            });
            return !!response.data.ok;
        } catch (error: any) {
            winston.error('Test send error', { error: error.message });
            return false;
        }
    }

    // Get comprehensive bot status
    async getBotStatus(): Promise<any> {
        try {
            const botResponse = await axios.get(`${this.apiUrl}/getMe`);
            if (!botResponse.data.ok) return null;

            const botInfo = botResponse.data.result;
            if (this.chatId) {
                await this.getChatInfo();
            }
            return botInfo;
        } catch (error: any) {
            winston.error('Bot status error', { error: error.message });
            return null;
        }
    }

    // Get chat info
    async getChatInfo(): Promise<any> {
        try {
            const response = await axios.post(`${this.apiUrl}/getChat`, {
                chat_id: this.chatId
            });
            return response.data.ok ? response.data.result : null;
        } catch (error: any) {
            winston.error('Get chat info error', { error: error.message });
            return null;
        }
    }
}

// Export singleton instance
export const telegramService = new TelegramService();
