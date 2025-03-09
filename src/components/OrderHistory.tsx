import React from 'react';
import { Package, ExternalLink } from 'lucide-react';

interface Order {
  id: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  txHash: string;
}

export function OrderHistory() {
  const orders: Order[] = [
    {
      id: 'ORD-001',
      date: '2024-03-15',
      status: 'delivered',
      total: 149.97,
      items: [
        { name: 'Premium Widget', quantity: 3, price: 29.99 },
        { name: 'Super Gadget', quantity: 1, price: 49.99 },
      ],
      txHash: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    },
    // Add more orders as needed
  ];

  return (
    <div className="bg-black/50 backdrop-blur-sm rounded-lg shadow-lg shadow-green-500/20 p-6 border border-green-500/20">
      <div className="flex items-center mb-6">
        <Package className="w-6 h-6 text-green-500 mr-2" />
        <h2 className="text-2xl font-bold text-green-500">Order History</h2>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="border border-green-500/20 rounded-lg p-4 hover:bg-green-500/5 transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-green-400 font-semibold">{order.id}</h3>
                <p className="text-green-400/70 text-sm">{order.date}</p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  order.status === 'delivered'
                    ? 'bg-green-900/50 text-green-400 border border-green-500/20'
                    : 'bg-yellow-900/50 text-yellow-400 border border-yellow-500/20'
                }`}
              >
                {order.status.toUpperCase()}
              </span>
            </div>

            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-green-400/80">
                  <span>{item.quantity}x {item.name}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-green-500/20">
              <div className="flex justify-between items-center">
                <span className="text-green-400 font-semibold">Total</span>
                <span className="text-green-500 font-bold">${order.total.toFixed(2)}</span>
              </div>
              <a
                href={`https://etherscan.io/tx/${order.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center mt-2 text-sm text-green-500 hover:text-green-400"
              >
                View Transaction
                <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}