import express from 'express';
import { chatService } from '../services/chat.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

router.post('/messages', async (req, res) => {
  try {
    const { userId, message } = req.body;
    const savedMessage = await chatService.saveMessage(userId, message);
    res.json(savedMessage);
  } catch (error) {
    logger.error('Save message error:', error);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

router.get('/messages/:userId', async (req, res) => {
  try {
    const messages = await chatService.getMessages(req.params.userId);
    res.json(messages);
  } catch (error) {
    logger.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

export { router };