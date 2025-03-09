import axios from 'axios';
import { supabase } from './supabase';
import { notifyDriver } from './telegram';
import { logger } from '../utils/logger';

export class BlockchainMonitor {
  private adminWallet: string;
  private websocket: WebSocket | null = null;
  private retryCount: number = 0;
  private readonly MAX_RETRIES = 3;
  private readonly WEBSOCKET_URL = 'wss://ws.blockchain.info/inv';
  private readonly COINDESK_API = 'https://api.coindesk.com/v1/bpi/currentprice/USD.json';

  constructor(adminWallet: string) {
    if (!adminWallet) {
      throw new Error('Admin wallet address is required');
    }
    this.adminWallet = adminWallet;
  }

  private setupWebSocket() {
    try {
      if (this.websocket?.readyState === WebSocket.OPEN) {
        return;
      }

      this.websocket = new WebSocket(this.WEBSOCKET_URL);

      this.websocket.onopen = () => {
        logger.info('WebSocket connection established');
        this.websocket?.send(JSON.stringify({
          "op": "addr_sub",
          "addr": this.adminWallet
        }));
        this.retryCount = 0;
      };

      this.websocket.onerror = (error) => {
        logger.error('WebSocket error:', error);
        this.handleConnectionError();
      };

      this.websocket.onclose = () => {
        logger.warn('WebSocket connection closed');
        this.handleConnectionError();
      };
    } catch (error) {
      logger.error('WebSocket setup error:', error);
      this.handleConnectionError();
    }
  }

  private handleConnectionError() {
    if (this.retryCount < this.MAX_RETRIES) {
      this.retryCount++;
      const delay = Math.min(1000 * Math.pow(2, this.retryCount), 30000);
      logger.info(`Retrying connection in ${delay}ms (attempt ${this.retryCount})`);
      setTimeout(() => this.setupWebSocket(), delay);
    } else {
      logger.error('Max retry attempts reached');
      throw new Error('Failed to establish payment monitoring connection');
    }
  }

  async monitorPayment(expectedAmount: string, orderId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.adminWallet) {
        reject(new Error('Admin wallet not configured'));
        return;
      }

      this.setupWebSocket();

      const timeout = setTimeout(() => {
        reject(new Error('Payment monitoring timed out'));
        this.stopMonitoring();
      }, 30 * 60 * 1000); // 30 minute timeout

      if (!this.websocket) {
        reject(new Error('WebSocket connection failed'));
        return;
      }

      this.websocket.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.op === 'utx' && data.x) {
            const tx = data.x;
            const receivedAmount = tx.out
              .filter((output: any) => output.addr === this.adminWallet)
              .reduce((sum: number, output: any) => sum + output.value, 0);

            if (receivedAmount.toString() === expectedAmount) {
              clearTimeout(timeout);
              logger.info(`Payment received for order ${orderId}: ${tx.hash}`);

              // Update order status
              const { error: updateError } = await supabase
                .from('orders')
                .update({ 
                  status: 'paid',
                  tx_hash: tx.hash,
                  paid_at: new Date().toISOString()
                })
                .eq('id', orderId);

              if (updateError) {
                logger.error('Failed to update order status:', updateError);
                throw updateError;
              }

              // Notify driver
              try {
                await notifyDriver(orderId);
                logger.info(`Driver notified for order ${orderId}`);
              } catch (notifyError) {
                logger.error('Failed to notify driver:', notifyError);
                // Don't throw here - payment was still successful
              }

              resolve(tx.hash);
            }
          }
        } catch (error) {
          logger.error('Payment processing error:', error);
          reject(error);
        }
      };
    });
  }

  async getBTCPrice(): Promise<number> {
    try {
      const response = await axios.get(this.COINDESK_API);
      return response.data.bpi.USD.rate_float;
    } catch (error) {
      logger.error('Error fetching BTC price:', error);
      throw new Error('Failed to fetch Bitcoin price');
    }
  }

  stopMonitoring() {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }
}