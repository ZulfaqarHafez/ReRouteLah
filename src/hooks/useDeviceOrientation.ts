'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface DeviceOrientationState {
  heading: number;        // Compass heading (0-360, 0 = North)
  pitch: number;          // Tilt front/back (-90 to 90)
  roll: number;           // Tilt left/right (-180 to 180)
  accuracy: number | null; // Compass accuracy in degrees (lower is better)
  isCalibrated: boolean;
  isSupported: boolean;
  permissionGranted: boolean;
  error: string | null;
}

interface UseDeviceOrientationOptions {
  smoothingFactor?: number;  // 0-1, higher = smoother but more lag
  calibrationThreshold?: number; // Minimum accuracy before considered calibrated
}

export function useDeviceOrientation(options: UseDeviceOrientationOptions = {}) {
  const { 
    smoothingFactor = 0.15, 
    calibrationThreshold = 15 
  } = options;

  const [state, setState] = useState<DeviceOrientationState>({
    heading: 0,
    pitch: 0,
    roll: 0,
    accuracy: null,
    isCalibrated: false,
    isSupported: false,
    permissionGranted: false,
    error: null,
  });

  // Use refs for smoothing calculations to avoid re-renders
  const smoothedHeading = useRef(0);
  const lastAlpha = useRef(0);
  const accuracyHistory = useRef<number[]>([]);

  // Request permission (required for iOS 13+)
  const requestPermission = useCallback(async () => {
    // @ts-ignore - DeviceOrientationEvent.requestPermission is iOS specific
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        // @ts-ignore
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === 'granted') {
          setState(prev => ({ ...prev, permissionGranted: true, error: null }));
          return true;
        } else {
          setState(prev => ({ 
            ...prev, 
            permissionGranted: false, 
            error: 'Orientation permission denied' 
          }));
          return false;
        }
      } catch (e) {
        setState(prev => ({ 
          ...prev, 
          error: 'Failed to request orientation permission' 
        }));
        return false;
      }
    }
    // Non-iOS devices don't need permission
    setState(prev => ({ ...prev, permissionGranted: true }));
    return true;
  }, []);

  // Calculate smoothed heading with wrap-around handling
  const smoothHeading = useCallback((newHeading: number) => {
    const current = smoothedHeading.current;
    let delta = newHeading - lastAlpha.current;
    
    // Handle wrap-around at 0/360
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    
    smoothedHeading.current = ((current + delta * smoothingFactor) % 360 + 360) % 360;
    lastAlpha.current = newHeading;
    
    return smoothedHeading.current;
  }, [smoothingFactor]);

  // Update accuracy history and determine calibration status
  const updateAccuracy = useCallback((accuracy: number | null) => {
    if (accuracy === null) return;
    
    accuracyHistory.current.push(accuracy);
    if (accuracyHistory.current.length > 10) {
      accuracyHistory.current.shift();
    }
    
    const avgAccuracy = accuracyHistory.current.reduce((a, b) => a + b, 0) / 
                        accuracyHistory.current.length;
    
    return avgAccuracy <= calibrationThreshold;
  }, [calibrationThreshold]);

  useEffect(() => {
    // Check if DeviceOrientationEvent is supported
    if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) {
      setState(prev => ({ 
        ...prev, 
        isSupported: false, 
        error: 'Device orientation not supported' 
      }));
      return;
    }

    setState(prev => ({ ...prev, isSupported: true }));

    const handleOrientation = (event: DeviceOrientationEvent) => {
      let heading = 0;
      let accuracy = null;
      
      // @ts-ignore - webkitCompassHeading is iOS specific
      if (event.webkitCompassHeading !== undefined) {
        // iOS devices provide compass heading directly
        // @ts-ignore
        heading = event.webkitCompassHeading;
        // @ts-ignore
        accuracy = event.webkitCompassAccuracy;
      } else if (event.alpha !== null) {
        // Android/standard: alpha is rotation around z-axis
        // alpha = 0 when arbitrary direction, increases counter-clockwise
        // We need to use absolute orientation if available
        if (event.absolute) {
          // Absolute orientation: alpha=0 is North
          heading = (360 - event.alpha) % 360;
        } else {
          // Relative orientation: we can still use it but it won't be true north
          heading = (360 - event.alpha) % 360;
        }
      }

      const smoothedValue = smoothHeading(heading);
      const isCalibrated = updateAccuracy(accuracy) ?? false;

      setState(prev => ({
        ...prev,
        heading: smoothedValue,
        pitch: event.beta ?? 0,   // -90 to 90 (front/back tilt)
        roll: event.gamma ?? 0,   // -180 to 180 (left/right tilt)
        accuracy,
        isCalibrated,
        error: null,
      }));
    };

    // Try to add listener
    const addListener = async () => {
      const hasPermission = await requestPermission();
      if (hasPermission) {
        window.addEventListener('deviceorientation', handleOrientation, true);
      }
    };

    addListener();

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [requestPermission, smoothHeading, updateAccuracy]);

  // Calculate bearing to a target point
  const calculateBearingTo = useCallback((
    currentLat: number, 
    currentLng: number, 
    targetLat: number, 
    targetLng: number
  ): number => {
    const toRad = (deg: number) => deg * (Math.PI / 180);
    const toDeg = (rad: number) => rad * (180 / Math.PI);

    const φ1 = toRad(currentLat);
    const φ2 = toRad(targetLat);
    const Δλ = toRad(targetLng - currentLng);

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    
    const bearing = toDeg(Math.atan2(y, x));
    return (bearing + 360) % 360;
  }, []);

  // Get rotation needed to point at target (for AR arrow)
  const getRotationToTarget = useCallback((
    currentLat: number,
    currentLng: number,
    targetLat: number,
    targetLng: number
  ): number => {
    const bearing = calculateBearingTo(currentLat, currentLng, targetLat, targetLng);
    let rotation = bearing - state.heading;
    
    // Normalize to -180 to 180 for smooth animation
    if (rotation > 180) rotation -= 360;
    if (rotation < -180) rotation += 360;
    
    return rotation;
  }, [calculateBearingTo, state.heading]);

  // Get cardinal direction from heading
  const getCardinalDirection = useCallback((): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(state.heading / 45) % 8;
    return directions[index];
  }, [state.heading]);

  // Trigger recalibration prompt
  const promptRecalibration = useCallback(() => {
    accuracyHistory.current = [];
    setState(prev => ({ 
      ...prev, 
      isCalibrated: false,
      error: 'Move your phone in a figure-8 pattern to calibrate the compass'
    }));
    
    // Clear error after 5 seconds
    setTimeout(() => {
      setState(prev => ({ ...prev, error: null }));
    }, 5000);
  }, []);

  return {
    ...state,
    requestPermission,
    calculateBearingTo,
    getRotationToTarget,
    getCardinalDirection,
    promptRecalibration,
  };
}

// Additional hook for geolocation
export function useGeolocation(options: PositionOptions = {}) {
  const [position, setPosition] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
    heading: number | null;
    speed: number | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  const watchIdRef = useRef<number | null>(null);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }

    setIsTracking(true);
    setError(null);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          heading: pos.coords.heading,
          speed: pos.coords.speed,
        });
        setError(null);
      },
      (err) => {
        setError(err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        ...options,
      }
    );
  }, [options]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  }, []);

  // Auto-start tracking
  useEffect(() => {
    startTracking();
    return () => stopTracking();
  }, [startTracking, stopTracking]);

  return {
    position,
    error,
    isTracking,
    startTracking,
    stopTracking,
  };
}

// Combined hook for AR navigation
export function useARNavigation() {
  const orientation = useDeviceOrientation({ smoothingFactor: 0.15 });
  const location = useGeolocation();

  const getNavigationState = useCallback((
    targetLat: number,
    targetLng: number
  ) => {
    if (!location.position) {
      return {
        rotation: 0,
        distance: 0,
        bearing: 0,
        isReady: false,
      };
    }

    const bearing = orientation.calculateBearingTo(
      location.position.latitude,
      location.position.longitude,
      targetLat,
      targetLng
    );

    const rotation = orientation.getRotationToTarget(
      location.position.latitude,
      location.position.longitude,
      targetLat,
      targetLng
    );

    // Calculate distance in km
    const R = 6371;
    const dLat = (targetLat - location.position.latitude) * Math.PI / 180;
    const dLng = (targetLng - location.position.longitude) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(location.position.latitude * Math.PI / 180) * 
              Math.cos(targetLat * Math.PI / 180) *
              Math.sin(dLng / 2) ** 2;
    const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return {
      rotation,
      distance,
      bearing,
      isReady: true,
      heading: orientation.heading,
      isCalibrated: orientation.isCalibrated,
      accuracy: location.position.accuracy,
    };
  }, [orientation, location.position]);

  return {
    orientation,
    location,
    getNavigationState,
    isReady: orientation.isSupported && orientation.permissionGranted && !!location.position,
  };
}
