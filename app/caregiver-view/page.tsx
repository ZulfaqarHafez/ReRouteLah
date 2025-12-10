'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Phone, MapPin, Navigation, Activity, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const MapDisplay = dynamic(() => import('../components/MapDisplay'), { 
  ssr: false, 
  loading: () => <div style={{color: 'white', padding: '20px'}}>Loading Map...</div>
});

export default function CaregiverRouteView() {
  const router = useRouter();
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [destination] = useState<{lat: number, lng: number}>({ 
    lat: 1.3521, 
    lng: 103.8198 
  }); // Orchard MRT
  const [isTracking, setIsTracking] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  const [distance, setDistance] = useState<number>(0);
  const [eta, setEta] = useState<number>(0);

  // Get current location
  useEffect(() => {
    if (!isTracking) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCurrentLocation(newLocation);
        setLocationError(null);
        
        // Calculate distance and ETA
        const dist = calculateDistance(
          newLocation.lat, 
          newLocation.lng, 
          destination.lat, 
          destination.lng
        );
        setDistance(dist);
        setEta(Math.ceil((dist / 5) * 60)); // 5km/h walking speed
      },
      (error) => {
        console.error('Location error:', error);
        setLocationError(error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isTracking, destination]);

  // Fetch route
  useEffect(() => {
    if (!currentLocation || !destination) return;

    const fetchRoute = async () => {
      try {
        const res = await fetch(
          `/api/navigation?startLat=${currentLocation.lat}&startLng=${currentLocation.lng}&destLat=${destination.lat}&destLng=${destination.lng}`
        );
        const data = await res.json();

        if (data.path && data.path.length > 0) {
          setRoutePath(data.path);
        } else {
          setRoutePath([
            [currentLocation.lat, currentLocation.lng],
            [destination.lat, destination.lng]
          ]);
        }
      } catch (err) {
        console.error('Route fetch error:', err);
        setRoutePath([
          [currentLocation.lat, currentLocation.lng],
          [destination.lat, destination.lng]
        ]);
      }
    };

    fetchRoute();
  }, [currentLocation, destination]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (deg: number): number => {
    return deg * (Math.PI / 180);
  };

  const startTracking = () => {
    setIsTracking(true);
  };

  const stopTracking = () => {
    setIsTracking(false);
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        padding: '16px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <button
            onClick={() => router.push('/profile')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '16px',
              color: '#1e40af',
              padding: '8px'
            }}
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 600, flex: 1 }}>
            Viewing User1's Route
          </h1>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: isTracking ? '#dcfce7' : '#f3f4f6',
            color: isTracking ? '#166534' : '#6b7280',
            padding: '6px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 600
          }}>
            <Activity size={14} />
            {isTracking ? 'TRACKING' : 'STOPPED'}
          </div>
        </div>

        {/* Patient Status Card */}
        <div style={{
          backgroundColor: '#f0f9ff',
          padding: '12px',
          borderRadius: '12px',
          border: '1px solid #bfdbfe'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600 }}>
                Eliza Wong
              </p>
              {locationError ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#dc2626', fontSize: '14px' }}>
                  <span>⚠️ {locationError}</span>
                </div>
              ) : currentLocation ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6b7280', fontSize: '14px' }}>
                  <MapPin size={14} />
                  <span>Lat: {currentLocation.lat.toFixed(6)}, Lng: {currentLocation.lng.toFixed(6)}</span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6b7280', fontSize: '14px' }}>
                  <span>📍 Location not available</span>
                </div>
              )}
            </div>
            <span style={{
              backgroundColor: isTracking && currentLocation ? '#dcfce7' : '#e5e7eb',
              color: isTracking && currentLocation ? '#166534' : '#6b7280',
              padding: '6px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 600
            }}>
              {isTracking && currentLocation ? 'On Route' : 'Inactive'}
            </span>
          </div>
        </div>

        {!isTracking && (
          <button
            onClick={startTracking}
            style={{
              width: '100%',
              marginTop: '12px',
              padding: '12px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Navigation size={16} />
            Start Tracking Location
          </button>
        )}
      </div>

      {/* Map View */}
      <div style={{ flex: 1, position: 'relative' }}>
        {currentLocation && isTracking ? (
          <MapDisplay 
            userLat={currentLocation.lat}
            userLng={currentLocation.lng}
            destLat={destination.lat}
            destLng={destination.lng}
            routePath={routePath}
          />
        ) : (
          <div style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f3f4f6',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <MapPin size={64} color="#9ca3af" />
            <div style={{ textAlign: 'center', color: '#6b7280' }}>
              <p style={{ fontSize: '18px', margin: '0 0 8px 0', fontWeight: 600 }}>
                Location Tracking Inactive
              </p>
              <p style={{ fontSize: '14px', margin: 0 }}>
                Click "Start Tracking Location" to view patient route
              </p>
            </div>
          </div>
        )}

        {isTracking && currentLocation && (
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            right: '20px',
            backgroundColor: 'white',
            padding: '16px',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <div style={{ marginBottom: '12px' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#6b7280' }}>
                Destination
              </p>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                Orchard MRT Station
              </p>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '12px',
              marginBottom: '12px'
            }}>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280' }}>
                  Distance
                </p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>
                  {distance.toFixed(1)} km
                </p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280' }}>
                  ETA
                </p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>
                  {eta} min
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => alert('Calling Eliza Wong...')}
                style={{
                  flex: 1,
                  padding: '14px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Phone size={20} />
                Call User1
              </button>

              <button
                onClick={stopTracking}
                style={{
                  padding: '14px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <RefreshCw size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}