import express from 'express';
import { referralService } from '../services/referral.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

router.post('/create', async (req, res) => {
  try {
    const { userId, referralCode } = req.body;
    const referral = await referralService.createReferral(userId, referralCode);
    res.json(referral);
  } catch (error) {
    logger.error('Create referral error:', error);
    res.status(500).json({ error: 'Failed to create referral' });
  }
});

router.post('/process', async (req, res) => {
  try {
    const { referralCode, newUserId } = req.body;
    await referralService.processReferral(referralCode, newUserId);
    res.json({ success: true });
  } catch (error) {
    logger.error('Process referral error:', error);
    res.status(500).json({ error: 'Failed to process referral' });
  }
});

export { router };