import express from 'express';
import { instagramBot } from '../services/instagram.js';
import { smsService } from '../services/sms.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Send order updates via both channels
router.post('/order-update', async (req, res) => {
  try {
    const { orderId, status, phone, instagramId } = req.body;

    const promises = [];

    if (phone) {
      promises.push(smsService.sendDeliveryUpdate(phone, orderId, status));
    }

    if (instagramId) {
      promises.push(instagramBot.sendOrderUpdate(instagramId, orderId, status));
    }

    await Promise.all(promises);

    res.json({ success: true });
  } catch (error) {
    logger.error('Failed to send order update:', error);
    res.status(500).json({ error: 'Failed to send order update' });
  }
});

// Send delivery confirmation
router.post('/delivery-confirmation', async (req, res) => {
  try {
    const { orderId, phone, instagramId } = req.body;

    const promises = [];

    if (phone) {
      promises.push(smsService.sendDeliveryConfirmation(phone, orderId));
    }

    if (instagramId) {
      promises.push(instagramBot.sendDeliveryConfirmation(instagramId, orderId));
    }

    await Promise.all(promises);

    res.json({ success: true });
  } catch (error) {
    logger.error('Failed to send delivery confirmation:', error);
    res.status(500).json({ error: 'Failed to send delivery confirmation' });
  }
});

export { router };