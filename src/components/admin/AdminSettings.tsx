import React, { useState } from 'react';
import { Settings, Save, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SystemSettings {
  allowNewRegistrations: boolean;
  maintenanceMode: boolean;
  orderNotifications: boolean;
  lowStockThreshold: number;
  maxOrderAmount: number;
}

export function AdminSettings() {
  const [settings, setSettings] = useState<SystemSettings>({
    allowNewRegistrations: true,
    maintenanceMode: false,
    orderNotifications: true,
    lowStockThreshold: 10,
    maxOrderAmount: 1000
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSuccess(false);
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Save settings to Supabase
      const { error: saveError } = await supabase
        .from('system_settings')
        .upsert({ 
          id: 1, // Single row for system settings
          ...settings,
          updated_at: new Date().toISOString()
        });

      if (saveError) throw saveError;
      
      setSuccess(true);
    } catch (err) {
      setError('Failed to save settings');
      console.error('Settings error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-black/50 backdrop-blur-sm p-6 rounded-lg border border-green-500/20">
        <div className="flex items-center mb-6">
          <Settings className="w-6 h-6 text-green-500 mr-2" />
          <h2 className="text-2xl font-bold text-green-500">System Settings</h2>
        </div>

        {error && (
          <div className="bg-red-900/50 text-red-400 p-4 rounded-lg border border-red-500/20 mb-6">
            <AlertTriangle className="w-5 h-5 inline-block mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-900/50 text-green-400 p-4 rounded-lg border border-green-500/20 mb-6">
            Settings saved successfully!
          </div>
        )}

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <label className="text-green-400">Allow New Registrations</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.allowNewRegistrations}
                onChange={e => handleChange('allowNewRegistrations', e.target.checked)}
              />
              <div className="w-11 h-6 bg-black/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-green-500 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500/20"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-green-400">Maintenance Mode</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.maintenanceMode}
                onChange={e => handleChange('maintenanceMode', e.target.checked)}
              />
              <div className="w-11 h-6 bg-black/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-green-500 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500/20"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-green-400">Order Notifications</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.orderNotifications}
                onChange={e => handleChange('orderNotifications', e.target.checked)}
              />
              <div className="w-11 h-6 bg-black/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-green-500 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500/20"></div>
            </label>
          </div>

          <div>
            <label className="block text-green-400 mb-2">Low Stock Threshold</label>
            <input
              type="number"
              value={settings.lowStockThreshold}
              onChange={e => handleChange('lowStockThreshold', parseInt(e.target.value))}
              className="w-full bg-black/30 border border-green-500/20 rounded-lg py-2 px-4 text-green-400 focus:outline-none focus:border-green-500/50"
            />
          </div>

          <div>
            <label className="block text-green-400 mb-2">Maximum Order Amount</label>
            <input
              type="number"
              value={settings.maxOrderAmount}
              onChange={e => handleChange('maxOrderAmount', parseInt(e.target.value))}
              className="w-full bg-black/30 border border-green-500/20 rounded-lg py-2 px-4 text-green-400 focus:outline-none focus:border-green-500/50"
            />
          </div>

          <button
            onClick={saveSettings}
            disabled={saving}
            className="w-full bg-green-500/20 text-green-400 py-3 px-4 rounded-lg hover:bg-green-500/30 transition-colors border border-green-500/20 flex items-center justify-center"
          >
            {saving ? (
              <span className="flex items-center">
                <Save className="w-5 h-5 mr-2 animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center">
                <Save className="w-5 h-5 mr-2" />
                Save Settings
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}