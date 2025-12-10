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

  // 1. Calculate Next Waypoint based on current location
  useEffect(() => {
    if (!routePath || routePath.length === 0) return;

    // Find the closest point on the route to the user
    let minDistance = Infinity;
    let closestIndex = 0;

    routePath.forEach((point, index) => {
      const dist = Math.sqrt(
        Math.pow(point[0] - currentLocation[0], 2) + 
        Math.pow(point[1] - currentLocation[1], 2)
      );
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = index;
      }
    });

    // Target the next point in the sequence (or the end if we are close to the end)
    // If we are at index i, aim for i+1.
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

  // 3. Handle Device Orientation
  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      let compass = 0;
      // @ts-ignore - webkitCompassHeading is iOS specific
      if (event.webkitCompassHeading) {
        // @ts-ignore
        compass = event.webkitCompassHeading;
      } else if (event.alpha) {
        // Standard: alpha=0 is North, increasing anti-clockwise.
        // So compass heading = 360 - alpha.
        compass = 360 - event.alpha;
      }
      setHeading(compass);
    };

    // Request permission for iOS 13+
    const requestAccess = async () => {
        // @ts-ignore
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                // @ts-ignore
                const response = await DeviceOrientationEvent.requestPermission();
                if (response === 'granted') {
                    window.addEventListener('deviceorientation', handleOrientation);
                } else {
                    setError('Orientation permission denied');
                }
            } catch (e) {
                console.error(e);
            }
        } else {
            window.addEventListener('deviceorientation', handleOrientation);
        }
    };

    requestAccess();

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

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

        {/* Error Message */}
        {error && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500/90 text-white p-6 rounded-xl text-center max-w-xs">
                <p className="font-bold mb-2">Camera Error</p>
                <p>{error}</p>
                <Button onClick={onClose} className="mt-4 w-full bg-white text-red-500 hover:bg-gray-100">
                    Close AR
                </Button>
            </div>
        )}
      </div>
    </div>
  );
}
