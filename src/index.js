import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { router as authRouter } from './routes/auth.js';
import { router as ordersRouter } from './routes/orders.js';
import { router as productsRouter } from './routes/products.js';
import { router as sheetsRouter } from './routes/sheets.js';
import { router as messagingRouter } from './routes/messaging.js';
import { errorHandler } from './middleware/error.js';
import { setupTelegramBot } from './services/telegram.js';
import { instagramBot } from './services/instagram.js';
import { logger } from './utils/logger.js';

dotenv.config();

const app = express();

// Configure CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/products', productsRouter);
app.use('/api/sheets', sheetsRouter);
app.use('/api/messaging', messagingRouter);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', async () => {
  logger.info(`Server running on port ${PORT}`);
  
  // Initialize bots
  try {
    await Promise.all([
      setupTelegramBot(),
      instagramBot.initialize()
    ]);
    logger.info('All messaging services initialized');
  } catch (error) {
    logger.error('Failed to initialize messaging services:', error);
  }
});