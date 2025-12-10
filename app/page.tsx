'use client';

import { useState, useEffect, useRef } from 'react';
import { Navigation, Bus, AlertTriangle, CheckCircle, Search, MapPin, Compass, Map as MapIcon, Video, ShieldAlert, User } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

const MapDisplay = dynamic(() => import('./components/MapDisplay'), { 
  ssr: false, 
  loading: () => <div style={{color: 'white', padding: '20px'}}>Loading Map...</div>
});

export default function ARNavigation() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [heading, setHeading] = useState(0); 
  const [bearing, setBearing] = useState(0); 
  const [currentPos, setCurrentPos] = useState<{lat: number, lng: number} | null>(null); 
  
  // Navigation States
  const [navInstruction, setNavInstruction] = useState<string>("Locating...");
  const [targetCoords, setTargetCoords] = useState<{latitude: number, longitude: number} | null>(null);
  const [isDirectMode, setIsDirectMode] = useState(false);
  const [viewMode, setViewMode] = useState<'ar' | 'map'>('ar');
  const [routePath, setRoutePath] = useState<[number, number][]>([]); 
  
  // Dynamic Destination State
  const [destination, setDestination] = useState<{latitude: number, longitude: number} | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Bus Data States
  const [busService, setBusService] = useState<string>('Scanning...');
  const [busLoad, setBusLoad] = useState<string | null>(null);
  const [nextBusTime, setNextBusTime] = useState('');
  const [loadingBus, setLoadingBus] = useState(false);

  const DEMO_BUS_STOP = '83139'; 

  const calculateBearing = (startLat: number, startLng: number, destLat: number, destLng: number) => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const toDeg = (rad: number) => (rad * 180) / Math.PI;

    const startLatRad = toRad(startLat);
    const startLngRad = toRad(startLng);
    const destLatRad = toRad(destLat);
    const destLngRad = toRad(destLng);

    const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad);
    const x = Math.cos(startLatRad) * Math.sin(destLatRad) -
              Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(destLngRad - startLngRad);
    
    let brng = toDeg(Math.atan2(y, x));
    return (brng + 360) % 360;
  };

  const startExperience = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      if (typeof DeviceOrientationEvent !== 'undefined' && 
          typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation);
        }
      } else {
        window.addEventListener('deviceorientation', handleOrientation);
      }

      navigator.geolocation.watchPosition(
        (position) => {
          setCurrentPos({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.error(error),
        { enableHighAccuracy: true }
      );

      setPermissionGranted(true);
    } catch (err) {
      console.error("Permission denied or error:", err);
      alert("Camera/Sensor access denied. AR features limited.");
    }
  };

  const handleOrientation = (event: DeviceOrientationEvent) => {
    if (event.alpha !== null) {
      const alpha = event.alpha;
      const adjustedHeading = (360 - alpha) % 360;
      setHeading(adjustedHeading);
    }
  };

  const fetchRoute = async (destLat: number, destLng: number) => {
    if (!currentPos) return;

    try {
      const res = await fetch(
        `/api/navigation?startLat=${currentPos.lat}&startLng=${currentPos.lng}&destLat=${destLat}&destLng=${destLng}`
      );
      const data = await res.json();

      if (data.useFallback || !data.path) {
        setIsDirectMode(true);
        setTargetCoords({ latitude: destLat, longitude: destLng });
        setNavInstruction("Navigate directly (straight line)");
        setRoutePath([[currentPos.lat, currentPos.lng], [destLat, destLng]]);
      } else {
        setIsDirectMode(false);
        setTargetCoords({ latitude: data.latitude, longitude: data.longitude });
        setNavInstruction(data.instruction || "Follow the path");
        setRoutePath(data.path);
      }
    } catch (err) {
      console.error(err);
      setIsDirectMode(true);
      setTargetCoords({ latitude: destLat, longitude: destLng });
      setNavInstruction("Navigate directly (error)");
    }
  };

  const searchLocation = async (query: string) => {
    if (!query.trim()) return;
    setIsSearching(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        setSearchResults(data.results.slice(0, 5));
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error(err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectDestination = (result: any) => {
    const lat = parseFloat(result.LATITUDE);
    const lng = parseFloat(result.LONGITUDE);
    setDestination({ latitude: lat, longitude: lng });
    setSearchQuery(result.SEARCHVAL);
    setSearchResults([]);
    fetchRoute(lat, lng);
  };

  const fetchBusArrival = async () => {
    setLoadingBus(true);
    try {
      const res = await fetch(`/api/lta/bus-arrival?code=${DEMO_BUS_STOP}`);
      const data = await res.json();

      if (data.Services && data.Services.length > 0) {
        const firstBus = data.Services[0];
        setBusService(firstBus.ServiceNo);
        setBusLoad(firstBus.NextBus?.Load || null);
        
        const eta = firstBus.NextBus?.EstimatedArrival;
        if (eta) {
          const arrivalTime = new Date(eta);
          const now = new Date();
          const diff = Math.floor((arrivalTime.getTime() - now.getTime()) / 60000);
          setNextBusTime(diff > 0 ? `${diff} min` : 'Arriving');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBus(false);
    }
  };

  const findNearestSafePoint = async () => {
    if (!currentPos) {
      alert("Location not available yet");
      return;
    }

    try {
      const res = await fetch(`/api/find-safe-point?lat=${currentPos.lat}&lng=${currentPos.lng}`);
      const data = await res.json();

      if (data.nearestPoint) {
        const sp = data.nearestPoint;
        setDestination({ latitude: sp.lat, longitude: sp.lng });
        setSearchQuery(sp.name);
        fetchRoute(sp.lat, sp.lng);
        alert(`Routing to: ${sp.name} (${data.distance.toFixed(2)}km away)`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to find safe point");
    }
  };

  useEffect(() => {
    if (permissionGranted && targetCoords && currentPos) {
      const newBearing = calculateBearing(
        currentPos.lat,
        currentPos.lng,
        targetCoords.latitude,
        targetCoords.longitude
      );
      setBearing(newBearing);
    }
  }, [currentPos, targetCoords, permissionGranted]);

  useEffect(() => {
    fetchBusArrival();
  }, []);

  const arrowRotation = bearing - heading;

  const getLoadColor = () => {
    if (!busLoad) return '#6b7280';
    if (busLoad === 'SEA') return '#10b981';
    if (busLoad === 'SDA') return '#f59e0b';
    return '#ef4444';
  };

  const getLoadText = () => {
    if (!busLoad) return 'Checking...';
    if (busLoad === 'SEA') return 'Seats Available';
    if (busLoad === 'SDA') return 'Standing Room';
    return 'Very Crowded - Wait!';
  };

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      backgroundColor: '#000',
      color: 'white',
      position: 'relative',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header with Profile Icon */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '16px',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)',
        zIndex: 20,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Navigation size={24} color="#3b82f6" />
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>SmartRoute Care</span>
        </div>
        
        {/* Profile Button */}
        <button
          onClick={() => router.push('/profile')}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)'
          }}
        >
          <User size={24} color="white" />
        </button>
      </div>

      {!permissionGranted ? (
        <div style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <Navigation size={80} style={{ marginBottom: '24px' }} />
          <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>ReRouteLah AR Navigation</h1>
          <p style={{ fontSize: '18px', marginBottom: '32px', opacity: 0.9 }}>
            Navigate Singapore safely with AR guidance
          </p>
          <button
            onClick={startExperience}
            style={{
              padding: '16px 32px',
              fontSize: '18px',
              fontWeight: 'bold',
              background: 'white',
              color: '#667eea',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}
          >
            Start Navigation
          </button>
        </div>
      ) : (
        <>
          {viewMode === 'ar' ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />

              <div style={{
                position: 'absolute',
                top: '80px',
                left: '20px',
                right: '20px',
                zIndex: 5
              }}>
                <div style={{
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  marginBottom: '12px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '8px'
                  }}>
                    <Bus size={20} />
                    <span style={{ fontWeight: 'bold' }}>Next Bus: {busService}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '14px' }}>{nextBusTime}</span>
                  </div>
                  <div style={{
                    padding: '8px 12px',
                    backgroundColor: getLoadColor(),
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontWeight: 'bold'
                  }}>
                    {getLoadText()}
                  </div>
                </div>

                {busLoad === 'LSD' && (
                  <div style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.9)',
                    padding: '12px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <AlertTriangle size={20} />
                    <span>⚠️ Bus very crowded - Consider waiting</span>
                  </div>
                )}
              </div>

              {targetCoords && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 10
                }}>
                  <div
                    style={{
                      fontSize: '80px',
                      transform: `rotate(${arrowRotation}deg)`,
                      transition: 'transform 0.3s ease-out',
                      filter: 'drop-shadow(0 0 20px rgba(16, 185, 129, 0.8))',
                      color: '#10b981'
                    }}
                  >
                    ↑
                  </div>
                </div>
              )}

              {navInstruction && (
                <div style={{
                  position: 'absolute',
                  bottom: '200px',
                  left: '20px',
                  right: '20px',
                  zIndex: 5
                }}>
                  <div style={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    padding: '16px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <Compass size={24} style={{ marginBottom: '8px' }} />
                    <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                      {navInstruction}
                    </p>
                    {isDirectMode && (
                      <p style={{ margin: '8px 0 0 0', fontSize: '14px', opacity: 0.8 }}>
                        (Simplified routing - walk directly)
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ height: '100%', width: '100%' }}>
              {currentPos && (
                <MapDisplay
                  currentPosition={currentPos}
                  destination={destination ? { lat: destination.latitude, lng: destination.longitude } : undefined}
                  routePath={routePath}
                />
              )}
            </div>
          )}

          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '20px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
            zIndex: 15
          }}>
            <div style={{ marginBottom: '16px', position: 'relative' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  placeholder="Search destination..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value.length > 2) {
                      searchLocation(e.target.value);
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    fontSize: '16px',
                    border: 'none',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    color: '#000'
                  }}
                />
                <button
                  onClick={() => searchQuery && searchLocation(searchQuery)}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: '#3b82f6',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer'
                  }}
                >
                  <Search size={20} />
                </button>
              </div>

              {searchResults.length > 0 && (
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  borderRadius: '12px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  color: '#000'
                }}>
                  {searchResults.map((result, idx) => (
                    <div
                      key={idx}
                      onClick={() => selectDestination(result)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: idx < searchResults.length - 1 ? '1px solid #e5e7eb' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <MapPin size={16} />
                      <div>
                        <p style={{ margin: 0, fontWeight: '600' }}>{result.SEARCHVAL}</p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                          {result.ADDRESS}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setViewMode(viewMode === 'ar' ? 'map' : 'ar')}
                style={{
                  flex: 1,
                  padding: '14px',
                  backgroundColor: '#3b82f6',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {viewMode === 'ar' ? <MapIcon size={20} /> : <Video size={20} />}
                {viewMode === 'ar' ? 'Map View' : 'AR View'}
              </button>

              <button
                onClick={findNearestSafePoint}
                style={{
                  padding: '14px 20px',
                  backgroundColor: '#ef4444',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              >
                <ShieldAlert size={24} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}