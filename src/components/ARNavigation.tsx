'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp, X } from 'lucide-react';

interface ARNavigationProps {
  currentLocation: [number, number]; // [lat, lng]
  routePath: [number, number][]; // Array of [lat, lng] points
  onClose: () => void;
}

export default function ARNavigation({ currentLocation, routePath, onClose }: ARNavigationProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [heading, setHeading] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [nextWaypoint, setNextWaypoint] = useState<[number, number] | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [needsPermission, setNeedsPermission] = useState<boolean>(false);

  // Helper: Calculate Haversine distance between two lat/lng points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // 1. Calculate Next Waypoint based on current location
  useEffect(() => {
    if (!routePath || routePath.length === 0) return;

    // Find the closest point on the route using proper Haversine distance
    let minDistance = Infinity;
    let closestIndex = 0;

    routePath.forEach((point, index) => {
      const dist = calculateDistance(
        currentLocation[0], currentLocation[1],
        point[0], point[1]
      );
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = index;
      }
    });

    // Target the next point in the sequence (or the end if we are close to the end)
    // Skip ahead by at least 1 point to avoid targeting points behind us
    const targetIndex = Math.min(closestIndex + 1, routePath.length - 1);
    setNextWaypoint(routePath[targetIndex]);

  }, [currentLocation, routePath]);

  // 2. Start Camera
  useEffect(() => {
    let stream: MediaStream | null = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError('Camera access denied. Please allow camera permission.');
        console.error(err);
      }
    }
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // 3. Handle Device Orientation (Gyroscope/Compass)
  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      let compass = 0;
      // @ts-ignore - webkitCompassHeading is iOS specific
      if (event.webkitCompassHeading) {
        // @ts-ignore - iOS provides true compass heading directly
        compass = event.webkitCompassHeading;
      } else if (event.alpha !== null) {
        // Android/Standard: alpha=0 is North, increases counter-clockwise
        // Convert to compass heading (0° = North, clockwise)
        compass = 360 - event.alpha;
      }
      setHeading(compass);
    };

    // Check if permission is needed (iOS 13+)
    // @ts-ignore
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      setNeedsPermission(true);
      setPermissionGranted(false);
    } else {
      // Android or older iOS - no permission needed
      window.addEventListener('deviceorientation', handleOrientation);
      setPermissionGranted(true);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  // Handle iOS orientation permission request (must be triggered by user action)
  const requestOrientationPermission = async () => {
    try {
      // @ts-ignore
      const response = await DeviceOrientationEvent.requestPermission();
      if (response === 'granted') {
        setPermissionGranted(true);
        setNeedsPermission(false);

        // Now add the event listener
        const handleOrientation = (event: DeviceOrientationEvent) => {
          let compass = 0;
          // @ts-ignore
          if (event.webkitCompassHeading) {
            // @ts-ignore
            compass = event.webkitCompassHeading;
          } else if (event.alpha !== null) {
            compass = 360 - event.alpha;
          }
          setHeading(compass);
        };
        window.addEventListener('deviceorientation', handleOrientation);
      } else {
        setError('Compass permission denied. AR navigation requires device orientation access.');
      }
    } catch (e) {
      console.error('Permission request error:', e);
      setError('Could not access device orientation sensor.');
    }
  };

  // 4. Calculate Bearing
  const calculateBearing = (startLat: number, startLng: number, destLat: number, destLng: number) => {
    const toRad = (deg: number) => deg * (Math.PI / 180);
    const toDeg = (rad: number) => rad * (180 / Math.PI);

    const lat1 = toRad(startLat);
    const lon1 = toRad(startLng);
    const lat2 = toRad(destLat);
    const lon2 = toRad(destLng);

    const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) -
              Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
    
    const bearing = toDeg(Math.atan2(y, x));
    return (bearing + 360) % 360;
  };

  const getArrowRotation = () => {
    if (!nextWaypoint) return 0;
    const bearing = calculateBearing(
      currentLocation[0], currentLocation[1],
      nextWaypoint[0], nextWaypoint[1]
    );
    // Arrow points UP (0 deg) by default.
    // We want arrow to point to Bearing relative to Heading.
    // Rotation = Bearing - Heading.
    return (bearing - heading + 360) % 360;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="relative flex-1 overflow-hidden">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted
          className="absolute inset-0 h-full w-full object-cover"
        />
        
        {/* AR Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div 
                className="transition-transform duration-300 ease-out drop-shadow-[0_0_15px_rgba(0,255,0,0.8)]"
                style={{ transform: `rotate(${getArrowRotation()}deg)` }}
            >
                <ArrowUp size={180} strokeWidth={3} className="text-green-400 fill-green-400/20" />
            </div>
            
            <div className="mt-12 bg-black/60 backdrop-blur-md text-white px-6 py-3 rounded-2xl text-center border border-white/10">
                <p className="font-bold text-xl">Follow the Arrow</p>
                <p className="text-sm text-gray-300">
                    {nextWaypoint ? "Head towards the next point" : "You have arrived"}
                </p>
            </div>
        </div>

        {/* Close Button */}
        <div className="absolute top-4 right-4 z-50">
            <Button 
                onClick={onClose} 
                variant="secondary" 
                size="icon"
                className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 border-none text-white"
            >
                <X className="h-6 w-6" />
            </Button>
        </div>

        {/* iOS Permission Request */}
        {needsPermission && !permissionGranted && !error && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-md p-6 rounded-2xl text-center max-w-sm pointer-events-auto shadow-2xl">
                <div className="text-4xl mb-4">🧭</div>
                <p className="font-bold text-lg mb-2 text-gray-900">Enable Compass</p>
                <p className="text-sm text-gray-600 mb-4">
                    AR navigation needs access to your device's compass to show you the right direction.
                </p>
                <Button
                    onClick={requestOrientationPermission}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-12"
                >
                    Enable Compass
                </Button>
            </div>
        )}

        {/* Error Message */}
        {error && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500/90 text-white p-6 rounded-xl text-center max-w-xs pointer-events-auto">
                <p className="font-bold mb-2">Sensor Error</p>
                <p className="text-sm">{error}</p>
                <Button onClick={onClose} className="mt-4 w-full bg-white text-red-500 hover:bg-gray-100">
                    Close AR
                </Button>
            </div>
        )}
      </div>
    </div>
  );
}
