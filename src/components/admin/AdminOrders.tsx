import React, { useState, useEffect } from 'react';
import { Package, Search, Filter, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Order {
  id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered';
  created_at: string;
  tx_hash: string;
}

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setOrders(data || []);
    } catch (err) {
      setError('Failed to fetch orders');
      console.error('Orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (updateError) throw updateError;

      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (err) {
      console.error('Update error:', err);
      // Show error toast
    }
  };

  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(search.toLowerCase()) ||
    order.tx_hash.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-black/30 rounded-lg"></div>
        <div className="h-64 bg-black/30 rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/50 text-red-400 p-4 rounded-lg border border-red-500/20">
        <AlertTriangle className="w-6 h-6 mb-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-black/50 backdrop-blur-sm p-6 rounded-lg border border-green-500/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Package className="w-6 h-6 text-green-500 mr-2" />
            <h2 className="text-2xl font-bold text-green-500">Orders</h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500/50" />
              <input
                type="text"
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 bg-black/30 border border-green-500/20 rounded-lg text-green-400 placeholder-green-500/50 focus:outline-none focus:border-green-500/50"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500/50" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10 pr-4 py-2 bg-black/30 border border-green-500/20 rounded-lg text-green-400 focus:outline-none focus:border-green-500/50"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-green-500/20">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-black/30 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 bg-black/30 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 bg-black/30 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 bg-black/30 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 bg-black/30 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-green-500/20">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="bg-black/20">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-400">{order.id}</div>
                    <div className="text-xs text-green-500/70">{order.tx_hash}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-green-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-green-400">
                      ${order.amount.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === 'delivered'
                        ? 'bg-green-900/50 text-green-400 border border-green-500/20'
                        : order.status === 'pending'
                        ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-500/20'
                        : 'bg-blue-900/50 text-blue-400 border border-blue-500/20'
                    }`}>
                      {order.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                      className="bg-black/30 border border-green-500/20 rounded text-green-400 text-sm px-2 py-1 focus:outline-none focus:border-green-500/50"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}