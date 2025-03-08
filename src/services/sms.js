import twilio from 'twilio';
import { logger } from '../utils/logger.js';

class SMSService {
  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }

  async sendSMS(to, message) {
    try {
      const result = await this.client.messages.create({
        body: message,
        to,
        from: process.env.TWILIO_PHONE_NUMBER
      });

      logger.info(`SMS sent to ${to}, SID: ${result.sid}`);
      return result;
    } catch (error) {
      logger.error('Failed to send SMS:', error);
      throw error;
    }
  }

  async sendOrderConfirmation(phone, orderId, amount) {
    const message = `🌿 ZaZoom Order Confirmation\nOrder #${orderId}\nAmount: $${amount}\nTrack your order at: https://zazoom.delivery/track/${orderId}`;
    return this.sendSMS(phone, message);
  }

  async sendDeliveryUpdate(phone, orderId, status) {
    const message = `🚚 ZaZoom Delivery Update\nOrder #${orderId}\nStatus: ${status}\nTime: ${new Date().toLocaleString()}`;
    return this.sendSMS(phone, message);
  }

  async sendDeliveryConfirmation(phone, orderId) {
    const message = `✅ Your ZaZoom order #${orderId} has been delivered!\nThank you for choosing ZaZoom Delivery.`;
    return this.sendSMS(phone, message);
  }
}

export const smsService = new SMSService();