'use client';

import { useState, useEffect, useRef } from 'react';
import { Navigation, Bus, AlertTriangle, CheckCircle } from 'lucide-react';

export default function ARNavigation() {
  // --- STATE SETUP ---
  const videoRef = useRef<HTMLVideoElement>(null); // Fixed: Added Type
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [heading, setHeading] = useState(0); 
  const [bearing, setBearing] = useState(0); 
  
  // New States for Bus Data
  const [busLoad, setBusLoad] = useState<string | null>(null); // Fixed: Added Type
  const [nextBusTime, setNextBusTime] = useState('');
  const [loadingBus, setLoadingBus] = useState(false);

  // --- CONFIG: Bus Stop for Demo ---
  const DEMO_BUS_STOP = '83139'; 
  const DEMO_BUS_SERVICE = '15'; 
  const DESTINATION = { latitude: 1.3155, longitude: 103.9059 }; 

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
      alert("Camera access denied");
    }

    // B. Request Device Orientation (Compass)
    // @ts-ignore
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        // @ts-ignore
        const response = await DeviceOrientationEvent.requestPermission();
        if (response === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation);
          setPermissionGranted(true);
        } else {
          alert("Permission denied for orientation");
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      // @ts-ignore
      window.addEventListener('deviceorientationabsolute', handleOrientation); 
      window.addEventListener('deviceorientation', handleOrientation); 
      setPermissionGranted(true);
    }

    // START BUS POLLING
    fetchBusData();
    setInterval(fetchBusData, 30000); 
  };

  // Fixed: Added 'any' type to event to stop TS complaining
  const handleOrientation = (event: any) => {
    let compass = event.webkitCompassHeading || Math.abs(event.alpha - 360);
    setHeading(compass);
  };

  // --- 2. THE NEW FEATURE: LTA API INTEGRATION ---
  const fetchBusData = async () => {
    setLoadingBus(true);
    try {
      const res = await fetch(`/api/lta/bus-arrival?code=${DEMO_BUS_STOP}`);
      const data = await res.json();
      
      // Fixed: Added 'any' type to 's'
      const myBus = data.Services?.find((s: any) => s.ServiceNo === DEMO_BUS_SERVICE);
      
      if (myBus && myBus.NextBus) {
        setBusLoad(myBus.NextBus.Load); 
        
        const arrival = new Date(myBus.NextBus.EstimatedArrival);
        const now = new Date();
        // Fixed: Added .getTime() for arithmetic
        const diffMs = arrival.getTime() - now.getTime();
        const diffMins = Math.ceil(diffMs / 60000);
        setNextBusTime(diffMins > 0 ? `${diffMins} min` : 'Arr');
        
        if (myBus.NextBus.Load === 'LSD' && navigator.vibrate) {
          navigator.vibrate([200, 100, 200]); 
        }
      }
    } catch (err) {
      console.error("Bus fetch failed", err);
    }
    setLoadingBus(false);
  };

  // --- 3. UI HELPERS ---
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
    <div style={{ position: 'relative', height: '100vh', background: 'black' }}>
      
      <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

      {!permissionGranted ? (
        <button 
          onClick={startExperience} 
          style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', padding: '20px', fontSize: '20px' }}>
          Start Demo
        </button>
      ) : (
        <>
          <div style={{
            position: 'absolute', 
            top: '20px', left: '20px', right: '20px',
            background: getStatusColor(), 
            border: busLoad === 'LSD' ? '4px solid red' : 'none',
            padding: '20px', 
            borderRadius: '15px',
            color: 'white', 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'background 0.5s'
          }}>
            <div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>Next Bus: {DEMO_BUS_SERVICE}</div>
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

          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: `translate(-50%, -50%) rotate(${(bearing - heading + 360) % 360}deg)`,
            transition: 'transform 0.1s ease-out',
            zIndex: 5
          }}>
            <Navigation size={120} color={busLoad === 'LSD' ? 'red' : '#00ff00'} fill={busLoad === 'LSD' ? 'red' : '#00ff00'} />
          </div>
        </>
      )}
    </div>
  );
}