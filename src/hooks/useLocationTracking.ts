import { useState, useEffect, useCallback, useRef } from "react";

interface LocationState {
  currentLocation: [number, number] | null;
  isTracking: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface RoutePoint {
  coordinates: [number, number];
}

interface UseLocationTrackingOptions {
  enableHighAccuracy?: boolean;
  updateInterval?: number;
  deviationThreshold?: number; // meters
  onDeviation?: (distance: number, currentLocation: [number, number]) => void;
  onLocationUpdate?: (location: [number, number]) => void;
}

// Haversine formula to calculate distance between two coordinates in meters
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Calculate minimum distance from a point to a route (array of points)
const getDistanceFromRoute = (
  location: [number, number],
  route: RoutePoint[]
): number => {
  if (route.length === 0) return 0;
  
  let minDistance = Infinity;
  
  for (const point of route) {
    const distance = calculateDistance(
      location[0],
      location[1],
      point.coordinates[0],
      point.coordinates[1]
    );
    if (distance < minDistance) {
      minDistance = distance;
    }
  }
  
  return minDistance;
};

export const useLocationTracking = (
  options: UseLocationTrackingOptions = {}
) => {
  const {
    enableHighAccuracy = true,
    updateInterval = 5000,
    deviationThreshold = 50, // 50 meters default
    onDeviation,
    onLocationUpdate,
  } = options;

  const [state, setState] = useState<LocationState>({
    currentLocation: null,
    isTracking: false,
    error: null,
    lastUpdated: null,
  });

  const [route, setRoute] = useState<RoutePoint[]>([]);
  const [isDeviated, setIsDeviated] = useState(false);
  const [deviationDistance, setDeviationDistance] = useState(0);
  
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handlePositionUpdate = useCallback(
    (position: GeolocationPosition) => {
      const newLocation: [number, number] = [
        position.coords.latitude,
        position.coords.longitude,
      ];

      setState((prev) => ({
        ...prev,
        currentLocation: newLocation,
        lastUpdated: new Date(),
        error: null,
      }));

      onLocationUpdate?.(newLocation);

      // Check for route deviation
      if (route.length > 0) {
        const distanceFromRoute = getDistanceFromRoute(newLocation, route);
        setDeviationDistance(distanceFromRoute);
        
        if (distanceFromRoute > deviationThreshold) {
          setIsDeviated(true);
          onDeviation?.(distanceFromRoute, newLocation);
        } else {
          setIsDeviated(false);
        }
      }
    },
    [route, deviationThreshold, onDeviation, onLocationUpdate]
  );

  const handleError = useCallback((error: GeolocationPositionError) => {
    setState((prev) => ({
      ...prev,
      error: error.message,
      isTracking: false,
    }));
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocation is not supported by your browser",
      }));
      return;
    }

    setState((prev) => ({ ...prev, isTracking: true, error: null }));

    // Get initial position
    navigator.geolocation.getCurrentPosition(handlePositionUpdate, handleError, {
      enableHighAccuracy,
    });

    // Set up continuous tracking
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePositionUpdate,
      handleError,
      {
        enableHighAccuracy,
        maximumAge: updateInterval,
        timeout: 10000,
      }
    );
  }, [handlePositionUpdate, handleError, enableHighAccuracy, updateInterval]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setState((prev) => ({ ...prev, isTracking: false }));
    setIsDeviated(false);
  }, []);

  const setActiveRoute = useCallback((newRoute: RoutePoint[]) => {
    setRoute(newRoute);
    setIsDeviated(false);
    setDeviationDistance(0);
  }, []);

  const clearRoute = useCallback(() => {
    setRoute([]);
    setIsDeviated(false);
    setDeviationDistance(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    ...state,
    isDeviated,
    deviationDistance,
    startTracking,
    stopTracking,
    setActiveRoute,
    clearRoute,
  };
};

// Simulated location tracking for demo purposes
export const useSimulatedLocationTracking = (
  initialLocation: [number, number],
  destinationLocation: [number, number] | null,
  options: UseLocationTrackingOptions = {}
) => {
  const {
    deviationThreshold = 50,
    onDeviation,
    onLocationUpdate,
  } = options;

  const [currentLocation, setCurrentLocation] = useState<[number, number]>(initialLocation);
  const [isTracking, setIsTracking] = useState(false);
  const [isDeviated, setIsDeviated] = useState(false);
  const [deviationDistance, setDeviationDistance] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const routeRef = useRef<RoutePoint[]>([]);

  const simulateMovement = useCallback(() => {
    if (!destinationLocation) return;

    setCurrentLocation((prev) => {
      // Calculate direction towards destination
      const latDiff = destinationLocation[0] - prev[0];
      const lonDiff = destinationLocation[1] - prev[1];
      
      // Add small random offset to simulate real movement
      const randomOffset = () => (Math.random() - 0.5) * 0.0002;
      
      // Move 1/50th of the way + some randomness
      const newLat = prev[0] + latDiff / 50 + randomOffset();
      const newLon = prev[1] + lonDiff / 50 + randomOffset();
      
      const newLocation: [number, number] = [newLat, newLon];
      
      setLastUpdated(new Date());
      onLocationUpdate?.(newLocation);
      
      // Check deviation from route
      if (routeRef.current.length > 0) {
        const distance = getDistanceFromRoute(newLocation, routeRef.current);
        setDeviationDistance(distance);
        
        if (distance > deviationThreshold) {
          setIsDeviated(true);
          onDeviation?.(distance, newLocation);
        } else {
          setIsDeviated(false);
        }
      }
      
      return newLocation;
    });
  }, [destinationLocation, deviationThreshold, onDeviation, onLocationUpdate]);

  const startTracking = useCallback(() => {
    setIsTracking(true);
    // Simulate location updates every 3 seconds
    intervalRef.current = setInterval(simulateMovement, 3000);
  }, [simulateMovement]);

  const stopTracking = useCallback(() => {
    setIsTracking(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const setActiveRoute = useCallback((route: RoutePoint[]) => {
    routeRef.current = route;
    setIsDeviated(false);
    setDeviationDistance(0);
  }, []);

  const triggerDeviation = useCallback(() => {
    // Manually trigger deviation for demo purposes
    setCurrentLocation((prev) => {
      const deviatedLocation: [number, number] = [
        prev[0] + 0.001, // Move ~100m off course
        prev[1] + 0.001,
      ];
      setIsDeviated(true);
      setDeviationDistance(100);
      onDeviation?.(100, deviatedLocation);
      return deviatedLocation;
    });
  }, [onDeviation]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    currentLocation,
    isTracking,
    isDeviated,
    deviationDistance,
    lastUpdated,
    startTracking,
    stopTracking,
    setActiveRoute,
    triggerDeviation,
  };
};
