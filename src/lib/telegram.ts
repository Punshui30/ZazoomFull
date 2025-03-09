import { supabase } from './supabase';

interface OrderDetails {
  id: string;
  amount: number;
  delivery_address?: string;
  customer_name?: string;
}

export async function notifyDriver(orderId: string) {
  try {
    // Fetch order details
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) throw error;
    if (!order) throw new Error('Order not found');

    const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    const driverChatId = import.meta.env.VITE_TELEGRAM_DRIVER_CHAT_ID;

    if (!botToken || !driverChatId) {
      console.warn('Telegram configuration missing');
      return;
    }

    const message = formatDeliveryMessage(order);

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: driverChatId,
        text: message,
        parse_mode: 'HTML'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Telegram API error: ${errorData.description}`);
    }

    // Update order status to indicate driver notification sent
    await supabase
      .from('orders')
      .update({ 
        driver_notified_at: new Date().toISOString(),
        status: 'processing'
      })
      .eq('id', orderId);

    return true;
  } catch (error) {
    console.error('Error notifying driver:', error);
    throw error;
  }
}

function formatDeliveryMessage(order: OrderDetails): string {
  return `
🚨 New Delivery Request 🚨

Order ID: ${order.id}
Amount: $${order.amount.toFixed(2)}
${order.delivery_address ? `\nDelivery Address: ${order.delivery_address}` : ''}
${order.customer_name ? `\nCustomer: ${order.customer_name}` : ''}

Status: Ready for Pickup 🚗

Instructions:
1. Reply /accept_${order.id} to claim this delivery
2. Reply /pickup_${order.id} when picked up
3. Reply /delivered_${order.id} when completed

Stay safe! 🌿
`;
}

export async function setupTelegramWebhook(webhookUrl: string) {
  try {
    const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      throw new Error('Telegram bot token not configured');
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message', 'callback_query']
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to set webhook: ${errorData.description}`);
    }

    return true;
  } catch (error) {
    console.error('Error setting up Telegram webhook:', error);
    throw error;
  }
}

export async function sendDeliveryUpdate(orderId: string, status: string, message: string) {
  try {
    const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    const driverChatId = import.meta.env.VITE_TELEGRAM_DRIVER_CHAT_ID;

    if (!botToken || !driverChatId) {
      console.warn('Telegram configuration missing');
      return;
    }

    const updateMessage = `
🔄 Delivery Update

Order ID: ${orderId}
Status: ${status}
${message}

Time: ${new Date().toLocaleTimeString()}
`;

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: driverChatId,
        text: updateMessage,
        parse_mode: 'HTML'
      })
    });

    return true;
  } catch (error) {
    console.error('Error sending delivery update:', error);
    throw error;
  }
}