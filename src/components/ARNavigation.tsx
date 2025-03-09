import React, { useEffect, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, ARButton, Controllers } from '@react-three/xr';
import { Text, useGLTF } from '@react-three/drei';
import { Camera, MapPin, Navigation2, AlertTriangle } from 'lucide-react';
import { calculateDistance } from '../lib/location';
import { supabase } from '../lib/supabase';

interface ARNavigationProps {
  pickupLocation: {
    latitude: number;
    longitude: number;
    name: string;
  };
  onClose: () => void;
}

interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export function ARNavigation({ pickupLocation, onClose }: ARNavigationProps) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [bearing, setBearing] = useState<number | null>(null);
  const [arSupported, setARSupported] = useState<boolean>(true);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const watchId = useRef<number | null>(null);

  // Load 3D models
  const { nodes } = useGLTF('/models/arrow.glb');

  useEffect(() => {
    // Check AR support
    if (!navigator.xr) {
      setARSupported(false);
      return;
    }

    // Request camera permission
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(() => setPermissionGranted(true))
      .catch(() => setPermissionGranted(false));

    // Start location tracking
    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });

        // Calculate distance and bearing to pickup location
        const dist = calculateDistance(
          position.coords.latitude,
          position.coords.longitude,
          pickupLocation.latitude,
          pickupLocation.longitude
        );
        setDistance(dist);

        // Calculate bearing for arrow direction
        const bear = calculateBearing(
          position.coords.latitude,
          position.coords.longitude,
          pickupLocation.latitude,
          pickupLocation.longitude
        );
        setBearing(bear);

        // Log pickup attempt for analytics
        if (dist < 10) { // Within 10 meters
          logPickupAttempt(position.coords);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    );

    return () => {
      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [pickupLocation]);

  const logPickupAttempt = async (coords: GeolocationCoordinates) => {
    try {
      await supabase.from('pickup_attempts').insert({
        pickup_location_id: pickupLocation.name,
        user_latitude: coords.latitude,
        user_longitude: coords.longitude,
        accuracy: coords.accuracy,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log pickup attempt:', error);
    }
  };

  if (!arSupported) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4">
        <div className="bg-red-900/50 text-red-400 p-6 rounded-lg max-w-md text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">AR Not Supported</h3>
          <p className="mb-4">Your device doesn't support AR features. Please use the map view instead.</p>
          <button
            onClick={onClose}
            className="bg-red-500/20 text-red-400 px-6 py-2 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Switch to Map View
          </button>
        </div>
      </div>
    );
  }

  if (!permissionGranted) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4">
        <div className="bg-yellow-900/50 text-yellow-400 p-6 rounded-lg max-w-md text-center">
          <Camera className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Camera Permission Required</h3>
          <p className="mb-4">Please allow camera access to use AR navigation.</p>
          <button
            onClick={onClose}
            className="bg-yellow-500/20 text-yellow-400 px-6 py-2 rounded-lg hover:bg-yellow-500/30 transition-colors"
          >
            Use Map Instead
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0">
      {/* AR View */}
      <Canvas>
        <XR>
          <Controllers />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />

          {/* Navigation Arrow */}
          {bearing !== null && (
            <group rotation={[0, bearing, 0]}>
              <primitive object={nodes.Arrow} />
              {distance && (
                <Text
                  position={[0, 0.5, -2]}
                  fontSize={0.2}
                  color="#39ff14"
                >
                  {`${Math.round(distance)}m`}
                </Text>
              )}
            </group>
          )}

          {/* Destination Marker */}
          {distance && distance < 50 && (
            <mesh position={[0, 0, -distance]}>
              <sphereGeometry args={[0.2, 32, 32]} />
              <meshStandardMaterial color="#39ff14" emissive="#39ff14" />
            </mesh>
          )}
        </XR>
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 text-[#39ff14]">
          <div className="flex items-center mb-2">
            <MapPin className="w-5 h-5 mr-2" />
            <span>{pickupLocation.name}</span>
          </div>
          {distance && (
            <div className="flex items-center">
              <Navigation2 className="w-5 h-5 mr-2" />
              <span>{Math.round(distance)}m away</span>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="bg-black/70 backdrop-blur-sm text-[#39ff14] px-4 py-2 rounded-lg"
        >
          Exit AR
        </button>
      </div>

      {/* Help Button */}
      <button
        onClick={() => {/* Show help modal */}}
        className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-[#39ff14] p-4 rounded-full"
      >
        ?
      </button>
    </div>
  );
}

// Helper function to calculate bearing between two points
function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δλ = toRad(lon2 - lon1);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) -
           Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  return toDeg(Math.atan2(y, x));
}