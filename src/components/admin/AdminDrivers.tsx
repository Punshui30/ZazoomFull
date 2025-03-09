import React, { useState, useEffect } from 'react';
import { Truck, User, Phone, MapPin, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Driver {
  id: string;
  name: string;
  phone: string;
  status: 'available' | 'busy' | 'offline';
  current_zone: string;
  total_deliveries: number;
  rating: number;
}

export function AdminDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('drivers')
        .select('*')
        .order('name');

      if (fetchError) throw fetchError;

      setDrivers(data || []);
    } catch (err) {
      setError('Failed to fetch drivers');
      console.error('Drivers error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateDriverStatus = async (driverId: string, status: Driver['status']) => {
    try {
      const { error: updateError } = await supabase
        .from('drivers')
        .update({ status })
        .eq('id', driverId);

      if (updateError) throw updateError;

      setDrivers(drivers.map(driver =>
        driver.id === driverId ? { ...driver, status } : driver
      ));
    } catch (err) {
      console.error('Update error:', err);
      // Show error toast
    }
  };

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
        <div className="flex items-center mb-6">
          <Truck className="w-6 h-6 text-green-500 mr-2" />
          <h2 className="text-2xl font-bold text-green-500">Drivers</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drivers.map((driver) => (
            <div
              key={driver.id}
              className="bg-black/30 rounded-lg p-4 border border-green-500/20"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <User className="w-10 h-10 text-green-500 mr-3" />
                  <div>
                    <h3 className="text-green-400 font-semibold">{driver.name}</h3>
                    <div className="flex items-center text-green-500/70 text-sm">
                      <Phone className="w-4 h-4 mr-1" />
                      {driver.phone}
                    </div>
                  </div>
                </div>
                <select
                  value={driver.status}
                  onChange={(e) => updateDriverStatus(driver.id, e.target.value as Driver['status'])}
                  className={`rounded px-2 py-1 text-sm ${
                    driver.status === 'available'
                      ? 'bg-green-900/50 text-green-400 border border-green-500/20'
                      : driver.status === 'busy'
                      ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-500/20'
                      : 'bg-red-900/50 text-red-400 border border-red-500/20'
                  }`}
                >
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="offline">Offline</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-green-400/70">
                  <MapPin className="w-4 h-4 mr-2" />
                  {driver.current_zone}
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-green-400/70">Total Deliveries</span>
                  <span className="text-green-400">{driver.total_deliveries}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-green-400/70">Rating</span>
                  <span className="text-green-400">
                    {driver.rating.toFixed(1)} / 5.0
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}