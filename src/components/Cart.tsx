import React from 'react';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWebSocket } from '../hooks/useWebSocket';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { logger } from '../utils/logger';

export function Cart() {
  const { items, updateQuantity, removeItem, total, clearCart } = useCart();
  const navigate = useNavigate();

  // Listen for real-time order updates
  useWebSocket(['order_update'], (event) => {
    if (event.type === 'order_update' && event.data.status === 'confirmed') {
      toast.success('Order confirmed! Redirecting to tracking...');
      navigate(`/track/${event.data.id}`);
    }
  });

  const handleCheckout = async () => {
    try {
      if (items.length === 0) {
        toast.error('Your cart is empty');
        return;
      }

      // Format items for storage
      const orderItems = items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));

      // Create order in database
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          amount: total,
          status: 'pending',
          items: orderItems,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        logger.error('Failed to create order:', error);
        throw error;
      }

      // Navigate to payment page with order details
      navigate('/checkout', { 
        state: { 
          orderId: order.id,
          amount: total
        }
      });

      // Clear the cart after successful order creation
      clearCart();
      
      toast.success('Order created successfully');
    } catch (err) {
      logger.error('Failed to create order:', err);
      toast.error('Failed to create order. Please try again.');
    }
  };

  if (items.length === 0) {
    return (
      <div id="cart" className="bg-black/50 backdrop-blur-sm p-6 rounded-lg border border-[#39ff14]/20 text-center">
        <ShoppingCart className="w-12 h-12 text-[#39ff14] mx-auto mb-4" />
        <p className="text-[#39ff14]">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div id="cart" className="bg-black/50 backdrop-blur-sm p-6 rounded-lg border border-[#39ff14]/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#39ff14]">Shopping Cart</h2>
        <ShoppingCart className="w-6 h-6 text-[#39ff14]" />
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 border border-[#39ff14]/20 rounded-lg"
          >
            <div className="flex items-center space-x-4">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              <div>
                <h3 className="text-[#39ff14] font-semibold">{item.name}</h3>
                <p className="text-[#39ff14]/70">${item.price.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="p-1 text-[#39ff14] hover:text-[#39ff14]/80 disabled:opacity-50"
                  disabled={item.quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-[#39ff14] w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="p-1 text-[#39ff14] hover:text-[#39ff14]/80"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => removeItem(item.id)}
                className="p-1 text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-[#39ff14]/20">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[#39ff14]">Total</span>
          <span className="text-[#39ff14] font-bold">${total.toFixed(2)}</span>
        </div>

        <button
          onClick={handleCheckout}
          className="w-full bg-[#39ff14]/20 text-[#39ff14] py-3 px-4 rounded-lg hover:bg-[#39ff14]/30 transition-colors border border-[#39ff14]/20"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}