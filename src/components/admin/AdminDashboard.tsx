import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Package, TrendingUp, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface DashboardStats {
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  revenue: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact' });

      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact' });

      const { data: orders } = await supabase
        .from('orders')
        .select('amount')
        .eq('status', 'delivered');

      const totalRevenue = orders?.reduce((sum, order) => sum + order.amount, 0) || 0;

      setStats({
        totalOrders: ordersCount || 0,
        totalUsers: usersCount || 0,
        totalProducts: productsCount || 0,
        revenue: totalRevenue
      });
    } catch (err) {
      setError('Failed to fetch dashboard stats');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-black/30 rounded-lg"></div>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-black/50 backdrop-blur-sm p-6 rounded-lg border border-green-500/20">
          <div className="flex items-center justify-between mb-4">
            <Package className="w-8 h-8 text-green-500" />
            <span className="text-3xl font-bold text-green-400">{stats.totalOrders}</span>
          </div>
          <h3 className="text-green-500">Total Orders</h3>
        </div>

        <div className="bg-black/50 backdrop-blur-sm p-6 rounded-lg border border-green-500/20">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-green-500" />
            <span className="text-3xl font-bold text-green-400">{stats.totalUsers}</span>
          </div>
          <h3 className="text-green-500">Active Users</h3>
        </div>

        <div className="bg-black/50 backdrop-blur-sm p-6 rounded-lg border border-green-500/20">
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="w-8 h-8 text-green-500" />
            <span className="text-3xl font-bold text-green-400">{stats.totalProducts}</span>
          </div>
          <h3 className="text-green-500">Products</h3>
        </div>

        <div className="bg-black/50 backdrop-blur-sm p-6 rounded-lg border border-green-500/20">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <span className="text-3xl font-bold text-green-400">
              ${stats.revenue.toFixed(2)}
            </span>
          </div>
          <h3 className="text-green-500">Total Revenue</h3>
        </div>
      </div>

      {/* Additional dashboard components can be added here */}
    </div>
  );
}