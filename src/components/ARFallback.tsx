import React from 'react';
import { Map, Navigation2, MapPin } from 'lucide-react';
import { calculateDistance } from '../lib/location';

interface ARFallbackProps {
  userLocation: {
    latitude: number;
    longitude: number;
  } | null;
  pickupLocation: {
    latitude: number;
    longitude: number;
    name: string;
  };
  onClose: () => void;
}

export function ARFallback({ userLocation, pickupLocation, onClose }: ARFallbackProps) {
  const distance = userLocation
    ? calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        pickupLocation.latitude,
        pickupLocation.longitude
      )
    : null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4">
      <div className="bg-black/50 backdrop-blur-sm rounded-lg p-6 max-w-md w-full border border-[#39ff14]/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Map className="w-6 h-6 text-[#39ff14] mr-2" />
            <h3 className="text-xl font-bold text-[#39ff14]">Navigation</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#39ff14] hover:text-[#39ff14]/80"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Location Info */}
          <div className="bg-black/30 p-4 rounded-lg border border-[#39ff14]/20">
            <div className="flex items-center mb-2">
              <MapPin className="w-5 h-5 text-[#39ff14] mr-2" />
              <span className="text-[#39ff14]">{pickupLocation.name}</span>
            </div>
            {distance && (
              <div className="flex items-center">
                <Navigation2 className="w-5 h-5 text-[#39ff14] mr-2" />
                <span className="text-[#39ff14]">
                  {Math.round(distance)}m away
                </span>
              </div>
            )}
          </div>

          {/* Directions */}
          <div className="bg-black/30 p-4 rounded-lg border border-[#39ff14]/20">
            <h4 className="text-[#39ff14] font-semibold mb-2">Directions:</h4>
            <ol className="list-decimal list-inside text-[#39ff14]/80 space-y-2">
              <li>Head towards {pickupLocation.name}</li>
              <li>Look for the green ZaZoom sign</li>
              <li>Our staff will be waiting to assist you</li>
            </ol>
          </div>

          {/* Open in Maps Button */}
          <button
            onClick={() => {
              const url = `https://www.google.com/maps/dir/?api=1&destination=${pickupLocation.latitude},${pickupLocation.longitude}`;
              window.open(url, '_blank');
            }}
            className="w-full bg-[#39ff14]/20 text-[#39ff14] py-3 px-4 rounded-lg hover:bg-[#39ff14]/30 transition-colors border border-[#39ff14]/20"
          >
            Open in Google Maps
          </button>
        </div>
      </div>
    </div>
  );
}