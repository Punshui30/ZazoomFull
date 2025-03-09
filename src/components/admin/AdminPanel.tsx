import React, { useState } from 'react';
import { Shield, Book, Users, Package, Truck, Settings, HelpCircle, LogOut, AlertTriangle, Lock } from 'lucide-react';
import { AdminDashboard } from './AdminDashboard';
import { AdminOrders } from './AdminOrders';
import { AdminProducts } from './AdminProducts';
import { AdminDrivers } from './AdminDrivers';
import { AdminSettings } from './AdminSettings';
import { AdminDocs } from './AdminDocs';
import { SecurityManager } from '../../lib/security';
import toast from 'react-hot-toast';

type Tab = 'dashboard' | 'orders' | 'products' | 'drivers' | 'settings' | 'docs';

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [burning, setBurning] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');

  const handleLogout = () => {
    SecurityManager.logout();
  };

  const handleBurn = async () => {
    if (window.confirm('WARNING: This will permanently delete all data and encrypt backups. Are you sure?')) {
      setShowPinModal(true);
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBurning(true);
    try {
      await SecurityManager.burnSystem(pin);
    } catch (error) {
      console.error('Burn failed:', error);
      toast.error('Invalid PIN');
      setBurning(false);
    }
    setShowPinModal(false);
    setPin('');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-black/50 backdrop-blur-sm border-r border-green-500/20 flex flex-col transition-all duration-300`}>
        <div className="p-4 border-b border-green-500/20 flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="w-6 h-6 text-green-500 mr-2" />
            {!sidebarCollapsed && (
              <h1 className="text-xl font-bold text-green-500">Admin Panel</h1>
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-green-500/70 hover:text-green-500 transition-colors"
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'dashboard', icon: Package, label: 'Dashboard' },
            { id: 'orders', icon: Package, label: 'Orders' },
            { id: 'products', icon: Package, label: 'Products' },
            { id: 'drivers', icon: Truck, label: 'Drivers' },
            { id: 'settings', icon: Settings, label: 'Settings' },
            { id: 'docs', icon: Book, label: 'Documentation' }
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as Tab)}
              className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                activeTab === id 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'text-green-500/70 hover:bg-green-500/10'
              }`}
              title={sidebarCollapsed ? label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="ml-3">{label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-green-500/20 space-y-2">
          <button
            onClick={handleBurn}
            className="w-full flex items-center p-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
            disabled={burning}
            title={sidebarCollapsed ? 'Emergency Burn' : undefined}
          >
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && (
              <span className="ml-3">{burning ? 'Burning...' : 'Emergency Burn'}</span>
            )}
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center p-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
            title={sidebarCollapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="p-8 flex-1 overflow-y-auto">
          <div className="max-w-[2000px] mx-auto">
            {activeTab === 'dashboard' && <AdminDashboard />}
            {activeTab === 'orders' && <AdminOrders />}
            {activeTab === 'products' && <AdminProducts />}
            {activeTab === 'drivers' && <AdminDrivers />}
            {activeTab === 'settings' && <AdminSettings />}
            {activeTab === 'docs' && <AdminDocs />}
          </div>
        </div>
      </div>

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-8 max-w-md w-full border border-red-500/20">
            <div className="flex items-center justify-center mb-6">
              <Lock className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-red-500 text-center mb-6">
              Enter Security PIN
            </h2>
            <form onSubmit={handlePinSubmit}>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full bg-black/30 border border-red-500/20 rounded-lg py-2 px-4 text-red-400 mb-4 focus:outline-none focus:border-red-500/50"
                placeholder="Enter PIN"
                required
              />
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPinModal(false);
                    setPin('');
                  }}
                  className="flex-1 bg-black/30 text-red-400/70 py-3 px-4 rounded-lg hover:bg-red-500/10 transition-colors border border-red-500/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={burning}
                  className="flex-1 bg-red-500/20 text-red-400 py-3 px-4 rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/20"
                >
                  {burning ? 'Burning...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}