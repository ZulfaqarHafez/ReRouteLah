'use client';

import { useState, useEffect, useRef } from 'react';
import { Navigation, Bus, AlertTriangle, CheckCircle, Search, MapPin, Compass, Map as MapIcon, Video } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamic import with no SSR to prevent build errors
const MapDisplay = dynamic(() => import('./components/MapDisplay'), { 
  ssr: false, 
  loading: () => <div style={{color: 'white', padding: '20px'}}>Loading Map...</div>
});

export default function ARNavigation() {
  // --- STATE SETUP ---
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

  // --- CONFIG ---
  const DEMO_BUS_STOP = '83139'; 

  // --- HELPER: Calculate Bearing (Math for Arrow) ---
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

  // --- 1. SENSOR & CAMERA LOGIC ---
  const startExperience = async () => {
    // A. Request Camera
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera Error:", err);
    }

    // B. Request Compass
    // @ts-ignore
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        // @ts-ignore
        const response = await DeviceOrientationEvent.requestPermission();
        if (response === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation);
          setPermissionGranted(true);
        }
      } catch (error) { console.error(error); }
    } else {
      // @ts-ignore
      window.addEventListener('deviceorientationabsolute', handleOrientation); 
      window.addEventListener('deviceorientation', handleOrientation); 
      setPermissionGranted(true);
    }

    // C. Start GPS & Navigation Logic
    if ('geolocation' in navigator) {
      navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentPos({ lat: latitude, lng: longitude }); // Update Map Pos
          
          if (destination) {
            const directBearing = calculateBearing(latitude, longitude, destination.latitude, destination.longitude);
            if (isDirectMode || !targetCoords) {
               setBearing(directBearing);
            }
            updateNavigation(latitude, longitude, destination);
          }
        },
        (error) => console.error("GPS Error", error),
        { enableHighAccuracy: true }
      );
    }

    // D. Start Bus Polling
    fetchBusData();
    setInterval(fetchBusData, 30000); 
  };

  const handleOrientation = (event: any) => {
    let compass = event.webkitCompassHeading || Math.abs(event.alpha - 360);
    setHeading(compass);
  };

  // --- 2. NAVIGATION API INTEGRATION (OneMap) ---
  const updateNavigation = async (currentLat: number, currentLng: number, dest: {latitude: number, longitude: number}) => {
    try {
      const res = await fetch(
        `/api/navigation?startLat=${currentLat}&startLng=${currentLng}&destLat=${dest.latitude}&destLng=${dest.longitude}`
      );
      const data = await res.json();

      if (data.useFallback || data.error) {
        setIsDirectMode(true);
        setNavInstruction("Direct Compass Mode");
        setTargetCoords(null); 
        
        // 🟢 NEW: Fallback - Draw a straight line if route fails so map isn't empty
        setRoutePath([[currentLat, currentLng], [dest.latitude, dest.longitude]]);
        
      } else if (data.latitude) {
        setIsDirectMode(false);
        setTargetCoords({ latitude: data.latitude, longitude: data.longitude });
        setNavInstruction(data.instruction); 
        
        // Save the route geometry
        if (data.path) {
          setRoutePath(data.path);
        }

        const turnBearing = calculateBearing(currentLat, currentLng, data.latitude, data.longitude);
        setBearing(turnBearing);
      }
    } catch (err) {
      console.error("Nav Error", err);
      setIsDirectMode(true);
      // Fallback straight line
      setRoutePath([[currentLat, currentLng], [dest.latitude, dest.longitude]]);
    }
  };

  // --- SEARCH ---
  const handleSearch = async (e: any) => {
    e.preventDefault();
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?q=${searchQuery}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error("Search failed", error);
    }
    setIsSearching(false);
  };

  const selectLocation = (result: any) => {
    const lat = parseFloat(result.LATITUDE);
    const lng = parseFloat(result.LONGITUDE);
    setDestination({ latitude: lat, longitude: lng });
    setSearchResults([]); 
    setSearchQuery(result.SEARCHVAL); 
    setNavInstruction(`Navigating to ${result.SEARCHVAL}...`);
  };

  // --- 3. LTA BUS API INTEGRATION ---
  const fetchBusData = async () => {
    setLoadingBus(true);
    try {
      const res = await fetch(`/api/lta/bus-arrival?code=${DEMO_BUS_STOP}`);
      const data = await res.json();
      const arrivingBus = data.Services && data.Services.length > 0 ? data.Services[0] : null;
      
      if (arrivingBus && arrivingBus.NextBus) {
        setBusService(arrivingBus.ServiceNo);
        setBusLoad(arrivingBus.NextBus.Load); 
        const arrival = new Date(arrivingBus.NextBus.EstimatedArrival);
        const now = new Date();
        const diffMs = arrival.getTime() - now.getTime();
        const diffMins = Math.ceil(diffMs / 60000);
        setNextBusTime(diffMins > 0 ? `${diffMins} min` : 'Arr');
        
        if (arrivingBus.NextBus.Load === 'LSD' && navigator.vibrate) {
          navigator.vibrate([200, 100, 200]); 
        }
      } else {
        setBusService("No Svc");
        setNextBusTime("--");
      }
    } catch (err) {
      console.error("Bus fetch failed", err);
    }
    setLoadingBus(false);
  };

  // --- 4. UI HELPERS ---
  const getStatusColor = () => {
    if (busLoad === 'SEA') return 'rgba(0, 255, 0, 0.6)'; 
    if (busLoad === 'SDA') return 'rgba(255, 165, 0, 0.6)'; 
    if (busLoad === 'LSD') return 'rgba(255, 0, 0, 0.7)'; 
    return 'rgba(0,0,0,0.5)'; 
  };
  const getStatusText = () => {
    if (busLoad === 'SEA') return 'Space Available - OK';
    if (busLoad === 'SDA') return 'Standing Only';
    if (busLoad === 'LSD') return 'CROWDED - WAIT';
    return 'Scanning...';
  };

  // --- RENDER ---
  return (
    <div style={{ position: 'relative', height: '100vh', background: 'black', overflow: 'hidden' }}>
      
      {/* VIEW MODE TOGGLE BUTTON */}
      <div style={{ position: 'absolute', top: '150px', right: '20px', zIndex: 50 }}>
        <button 
          onClick={() => setViewMode(viewMode === 'ar' ? 'map' : 'ar')}
          style={{ 
            background: 'white', border: 'none', borderRadius: '50%', width: '50px', height: '50px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
          }}
        >
          {viewMode === 'ar' ? <MapIcon color="black" /> : <Video color="black" />}
        </button>
      </div>

      {/* 1. VIEW: AR CAMERA */}
      <div style={{ 
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
        visibility: viewMode === 'ar' ? 'visible' : 'hidden' 
      }}>
        <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* 2. VIEW: MAP DISPLAY */}
      {viewMode === 'map' && currentPos && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 5, background: '#eee' }}>
          <MapDisplay 
            userLat={currentPos.lat} 
            userLng={currentPos.lng} 
            destLat={destination?.latitude}
            destLng={destination?.longitude}
            routePath={routePath} 
          />
        </div>
      )}

      {/* SEARCH OVERLAY (Always visible) */}
      <div style={{ 
          position: 'absolute', top: '10px', left: '10px', right: '10px', 
          zIndex: 60, display: 'flex', flexDirection: 'column', gap: '5px' 
      }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '5px' }}>
            <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search destination..."
                style={{ 
                    flex: 1, padding: '12px', borderRadius: '8px', border: 'none', 
                    background: 'rgba(255,255,255,0.9)', color: '#000' 
                }}
            />
            <button type="submit" style={{ 
                padding: '12px', borderRadius: '8px', border: 'none', 
                background: '#0070f3', color: 'white' 
            }}>
                <Search size={20} />
            </button>
        </form>
        {/* Results... */}
        {searchResults.length > 0 && (
            <div style={{ 
                background: 'rgba(255,255,255,0.95)', borderRadius: '8px', 
                maxHeight: '200px', overflowY: 'auto', padding: '5px' 
            }}>
                {searchResults.map((res, idx) => (
                    <div 
                        key={idx} 
                        onClick={() => selectLocation(res)}
                        style={{ 
                            padding: '10px', borderBottom: '1px solid #eee', 
                            color: 'black', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                        }}
                    >
                        <MapPin size={16} />
                        <div>
                            <div style={{ fontWeight: 'bold' }}>{res.SEARCHVAL}</div>
                            <div style={{ fontSize: '12px', color: '#555' }}>{res.ADDRESS}</div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {!permissionGranted ? (
        <button 
          onClick={startExperience} 
          style={{ 
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', 
            padding: '20px 40px', fontSize: '20px', zIndex: 50, 
            background: '#0070f3', color: 'white', border: 'none', borderRadius: '12px'
          }}>
          Start AR Navigation
        </button>
      ) : (
        <>
          {/* TOP HUD: BUS SAFETY */}
          <div style={{
            position: 'absolute', 
            top: '80px', left: '20px', right: '20px',
            background: getStatusColor(), 
            border: busLoad === 'LSD' ? '4px solid red' : 'none',
            padding: '20px', 
            borderRadius: '15px',
            color: 'white', 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'background 0.5s',
            zIndex: 10
          }}>
            <div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>Next Bus: {busService}</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{nextBusTime}</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '5px' }}>
                {getStatusText()}
              </div>
            </div>
            
            <div>
              {busLoad === 'SEA' && <CheckCircle size={48} />}
              {busLoad === 'LSD' && <AlertTriangle size={48} />}
              {busLoad === null && <Bus size={48} />}
            </div>
          </div>

          {/* MIDDLE: AR ARROW (Only in AR Mode) */}
          {viewMode === 'ar' && (
            <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: `translate(-50%, -50%) rotate(${(bearing - heading + 360) % 360}deg)`,
                transition: 'transform 0.1s ease-out',
                zIndex: 5
            }}>
                <Navigation size={120} color={busLoad === 'LSD' ? 'red' : '#00ff00'} fill={busLoad === 'LSD' ? 'red' : '#00ff00'} />
            </div>
          )}

          {/* BOTTOM HUD: NAVIGATION INSTRUCTIONS */}
          <div style={{
            position: 'absolute', 
            bottom: '40px', left: '20px', right: '20px',
            background: 'rgba(0,0,0,0.8)', 
            padding: '15px', 
            borderRadius: '10px',
            color: '#fff',
            textAlign: 'center',
            zIndex: 10
          }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              {isDirectMode && <Compass size={24} color="#ffcc00"/>}
              {navInstruction}
            </div>
            {destination && (
                <div style={{ fontSize: '12px', color: '#aaa' }}>
                Navigating to: {searchQuery}
                </div>
            )}
            {!destination && (
                <div style={{ fontSize: '12px', color: '#ffcc00' }}>
                Please search for a destination above
                </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}