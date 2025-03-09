import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Package, Truck, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DeliveryStatus {
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered';
  estimated_time: string;
  current_zone: string;
  order_id: string;
  updated_at: string;
}

export function DeliveryTracking({ orderId }: { orderId: string }) {
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeliveryStatus = async () => {
      try {
        const { data, error: err } = await supabase
          .from('delivery_status')
          .select('*')
          .eq('order_id', orderId)
          .single();
        
        if (err) {
          throw err;
        }
        
        if (data) {
          setDeliveryStatus(data as DeliveryStatus);
        }
      } catch (err) {
        setError('Could not fetch delivery status');
        console.error('Error:', err);
      }
    };

    fetchDeliveryStatus();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchDeliveryStatus, 30000);

    return () => clearInterval(interval);
  }, [orderId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-6 h-6" />;
      case 'assigned':
        return <MapPin className="w-6 h-6" />;
      case 'picked_up':
        return <Package className="w-6 h-6" />;
      case 'in_transit':
        return <Truck className="w-6 h-6" />;
      case 'delivered':
        return <CheckCircle className="w-6 h-6" />;
      default:
        return <Clock className="w-6 h-6" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500';
      case 'assigned':
        return 'text-blue-500';
      case 'picked_up':
        return 'text-purple-500';
      case 'in_transit':
        return 'text-orange-500';
      case 'delivered':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  if (error) {
    return (
      <div className="bg-red-900/50 text-red-400 p-4 rounded-lg border border-red-500/20">
        {error}
      </div>
    );
  }

  if (!deliveryStatus) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-black/30 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="bg-black/50 backdrop-blur-sm p-6 rounded-lg shadow-lg shadow-green-500/20 border border-green-500/20">
      <h2 className="text-xl font-bold text-green-500 mb-6">Delivery Status</h2>

      <div className="space-y-6">
        {/* Status Timeline */}
        <div className="relative">
          <div className="absolute left-8 top-0 h-full w-0.5 bg-green-500/20"></div>
          
          {['pending', 'assigned', 'picked_up', 'in_transit', 'delivered'].map((status, index) => {
            const isActive = deliveryStatus.status === status;
            const isPast = ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered']
              .indexOf(deliveryStatus.status) >= ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered']
              .indexOf(status);

            return (
              <div key={status} className={`relative flex items-center mb-4 ${index === 4 ? '' : 'pb-4'}`}>
                <div className={`w-16 flex justify-center ${getStatusColor(isPast ? status : 'inactive')}`}>
                  {getStatusIcon(status)}
                </div>
                <div className="ml-4">
                  <h3 className={`font-semibold ${
                    isPast ? getStatusColor(status) : 'text-gray-500'
                  }`}>
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                  </h3>
                  {isActive && (
                    <p className="text-green-400/70 text-sm">
                      {deliveryStatus.current_zone}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ETA */}
        <div className="bg-black/30 p-4 rounded-lg border border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400">Estimated Delivery Time</p>
              <p className="text-green-500 text-lg font-semibold">
                {new Date(deliveryStatus.estimated_time).toLocaleTimeString()}
              </p>
            </div>
            <Clock className="w-6 h-6 text-green-500" />
          </div>
        </div>

        <div className="text-center text-green-400/70 text-sm">
          Last updated: {new Date(deliveryStatus.updated_at).toLocaleString()}
        </div>
      </div>
    </div>
  );
}