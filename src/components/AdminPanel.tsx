import React, { useState } from 'react';
import { Shield, Book, Users, Package, Truck, Settings, HelpCircle, LogOut, AlertTriangle } from 'lucide-react';
import { AdminDashboard } from './admin/AdminDashboard';
import { AdminOrders } from './admin/AdminOrders';
import { AdminProducts } from './admin/AdminProducts';
import { AdminDrivers } from './admin/AdminDrivers';
import { AdminSettings } from './admin/AdminSettings';
import { AdminDocs } from './admin/AdminDocs';
import { SecurityManager } from '../lib/security';

type Tab = 'dashboard' | 'orders' | 'products' | 'drivers' | 'settings' | 'docs';

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [burning, setBurning] = useState(false);

  const handleLogout = () => {
    SecurityManager.logout();
  };

  const handleBurn = async () => {
    if (window.confirm('WARNING: This will permanently delete all data and encrypt backups. Are you sure?')) {
      setBurning(true);
      try {
        await SecurityManager.burnSystem();
      } catch (error) {
        console.error('Burn failed:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-black/50 backdrop-blur-sm border-r border-green-500/20">
        <div className="p-4 border-b border-green-500/20">
          <div className="flex items-center">
            <Shield className="w-6 h-6 text-green-500 mr-2" />
            <h1 className="text-xl font-bold text-green-500">Admin Panel</h1>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center p-3 rounded-lg transition-colors ${
              activeTab === 'dashboard' ? 'bg-green-500/20 text-green-400' : 'text-green-500/70 hover:bg-green-500/10'
            }`}
          >
            <Package className="w-5 h-5 mr-3" />
            Dashboard
          </button>
          
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center p-3 rounded-lg transition-colors ${
              activeTab === 'orders' ? 'bg-green-500/20 text-green-400' : 'text-green-500/70 hover:bg-green-500/10'
            }`}
          >
            <Package className="w-5 h-5 mr-3" />
            Orders
          </button>
          
          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center p-3 rounded-lg transition-colors ${
              activeTab === 'products' ? 'bg-green-500/20 text-green-400' : 'text-green-500/70 hover:bg-green-500/10'
            }`}
          >
            <Package className="w-5 h-5 mr-3" />
            Products
          </button>
          
          <button
            onClick={() => setActiveTab('drivers')}
            className={`w-full flex items-center p-3 rounded-lg transition-colors ${
              activeTab === 'drivers' ? 'bg-green-500/20 text-green-400' : 'text-green-500/70 hover:bg-green-500/10'
            }`}
          >
            <Truck className="w-5 h-5 mr-3" />
            Drivers
          </button>
          
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center p-3 rounded-lg transition-colors ${
              activeTab === 'settings' ? 'bg-green-500/20 text-green-400' : 'text-green-500/70 hover:bg-green-500/10'
            }`}
          >
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </button>
          
          <button
            onClick={() => setActiveTab('docs')}
            className={`w-full flex items-center p-3 rounded-lg transition-colors ${
              activeTab === 'docs' ? 'bg-green-500/20 text-green-400' : 'text-green-500/70 hover:bg-green-500/10'
            }`}
          >
            <Book className="w-5 h-5 mr-3" />
            Documentation
          </button>
          
          <button
            onClick={handleBurn}
            className="w-full flex items-center p-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors mt-8"
            disabled={burning}
          >
            <AlertTriangle className="w-5 h-5 mr-3" />
            {burning ? 'Burning...' : 'Emergency Burn'}
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center p-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'dashboard' && <AdminDashboard />}
        {activeTab === 'orders' && <AdminOrders />}
        {activeTab === 'products' && <AdminProducts />}
        {activeTab === 'drivers' && <AdminDrivers />}
        {activeTab === 'settings' && <AdminSettings />}
        {activeTab === 'docs' && <AdminDocs />}
      </div>
    </div>
  );
}