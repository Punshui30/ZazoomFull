import axios from 'axios';
import { supabase } from './supabase';
import { logger } from '../utils/logger';

// Create axios instance with proper base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
  } catch (error) {
    logger.error('Auth interceptor error:', error);
    return config;
  }
}, (error) => {
  logger.error('Request interceptor error:', error);
  return Promise.reject(error);
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      // Server responded with error
      logger.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config.url
      });

      // Handle specific error cases
      switch (error.response.status) {
        case 401:
          // Unauthorized - redirect to login
          window.location.href = '/login';
          break;
        case 403:
          // Forbidden - show error message
          throw new Error('You do not have permission to perform this action');
        case 404:
          // Not found
          throw new Error('The requested resource was not found');
        case 429:
          // Rate limited
          throw new Error('Too many requests. Please try again later.');
        default:
          throw error;
      }
    } else if (error.request) {
      // Request made but no response
      logger.error('Network Error:', error.request);
      throw new Error('Network error. Please check your connection.');
    } else {
      logger.error('Error:', error.message);
      throw error;
    }
  }
);

// API endpoints
const endpoints = {
  // Auth
  login: '/auth/login',
  register: '/auth/register',
  logout: '/auth/logout',

  // Orders
  orders: '/orders',
  orderStatus: (id: string) => `/orders/${id}/status`,
  createOrder: '/orders/create',
  updateOrder: (id: string) => `/orders/${id}`,

  // Products
  products: '/products',
  product: (id: string) => `/products/${id}`,
  inventory: '/products/inventory',

  // Delivery
  delivery: '/delivery',
  trackDelivery: (id: string) => `/delivery/${id}/track`,
  assignDriver: (orderId: string, driverId: string) => `/delivery/${orderId}/assign/${driverId}`,

  // Messaging
  messages: '/messaging',
  sendMessage: '/messaging/send',
  messageHistory: (userId: string) => `/messaging/${userId}/history`,

  // Health check
  health: '/health'
};

// API methods
const apiMethods = {
  // Health check
  checkHealth: async () => {
    try {
      const response = await api.get(endpoints.health);
      return response.data.status === 'ok';
    } catch (error) {
      logger.error('Health check failed:', error);
      return false;
    }
  },

  // Orders
  createOrder: async (orderData: any) => {
    const response = await api.post(endpoints.createOrder, orderData);
    return response.data;
  },

  getOrderStatus: async (orderId: string) => {
    const response = await api.get(endpoints.orderStatus(orderId));
    return response.data;
  },

  updateOrder: async (orderId: string, updateData: any) => {
    const response = await api.put(endpoints.updateOrder(orderId), updateData);
    return response.data;
  },

  // Products
  getProducts: async () => {
    const response = await api.get(endpoints.products);
    return response.data;
  },

  getProduct: async (productId: string) => {
    const response = await api.get(endpoints.product(productId));
    return response.data;
  },

  updateInventory: async (productId: string, quantity: number) => {
    const response = await api.put(endpoints.product(productId), { quantity });
    return response.data;
  },

  // Delivery
  trackDelivery: async (deliveryId: string) => {
    const response = await api.get(endpoints.trackDelivery(deliveryId));
    return response.data;
  },

  assignDriver: async (orderId: string, driverId: string) => {
    const response = await api.post(endpoints.assignDriver(orderId, driverId));
    return response.data;
  },

  // Messaging
  sendMessage: async (message: any) => {
    const response = await api.post(endpoints.sendMessage, message);
    return response.data;
  },

  getMessageHistory: async (userId: string) => {
    const response = await api.get(endpoints.messageHistory(userId));
    return response.data;
  }
};

// Test connection
export const testApiConnection = async () => {
  try {
    return await apiMethods.checkHealth();
  } catch (error) {
    logger.error('API connection test failed:', error);
    return false;
  }
};

export { api as default, endpoints, apiMethods };