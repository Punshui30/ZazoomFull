import { supabase } from './supabase';
import { logger } from '../utils/logger';

export type WebSocketEvent = 
  | { type: 'order_update'; data: any }
  | { type: 'delivery_update'; data: any }
  | { type: 'chat_message'; data: any }
  | { type: 'inventory_update'; data: any };

class WebSocketService {
  private static instance: WebSocketService;
  private subscriptions: { [key: string]: () => void } = {};
  private listeners: ((event: WebSocketEvent) => void)[] = [];

  private constructor() {
    this.initializeSubscriptions();
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  private initializeSubscriptions() {
    // Subscribe to order updates
    const orderSubscription = supabase
      .channel('orders')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'orders' 
        },
        (payload) => {
          this.broadcast({
            type: 'order_update',
            data: payload.new
          });
        }
      )
      .subscribe((status) => {
        logger.info('Order subscription status:', status);
      });

    // Subscribe to delivery updates
    const deliverySubscription = supabase
      .channel('delivery_status')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'delivery_status'
        },
        (payload) => {
          this.broadcast({
            type: 'delivery_update',
            data: payload.new
          });
        }
      )
      .subscribe((status) => {
        logger.info('Delivery subscription status:', status);
      });

    // Subscribe to chat messages
    const chatSubscription = supabase
      .channel('chat_messages')
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          this.broadcast({
            type: 'chat_message',
            data: payload.new
          });
        }
      )
      .subscribe((status) => {
        logger.info('Chat subscription status:', status);
      });

    // Subscribe to inventory updates
    const inventorySubscription = supabase
      .channel('products')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          this.broadcast({
            type: 'inventory_update',
            data: payload.new
          });
        }
      )
      .subscribe((status) => {
        logger.info('Inventory subscription status:', status);
      });

    // Store cleanup functions
    this.subscriptions = {
      orders: () => orderSubscription.unsubscribe(),
      delivery: () => deliverySubscription.unsubscribe(),
      chat: () => chatSubscription.unsubscribe(),
      inventory: () => inventorySubscription.unsubscribe()
    };
  }

  public subscribe(callback: (event: WebSocketEvent) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private broadcast(event: WebSocketEvent) {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        logger.error('Error in WebSocket listener:', error);
      }
    });
  }

  public cleanup() {
    Object.values(this.subscriptions).forEach(unsubscribe => unsubscribe());
    this.listeners = [];
  }
}

export const websocketService = WebSocketService.getInstance();