'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Phone, PhoneOff, Map, Mic, MicOff, MapPin, Navigation as NavIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CaregiverCameraView() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [targetCoords] = useState({ latitude: 1.3521, longitude: 103.8198 }); // Orchard MRT
  const [bearing, setBearing] = useState<number>(0);
  const [busInfo] = useState({
    nextBus: '12',
    status: 'Air Space Available - OK',
    color: '#10b981'
  });

  // Get real camera feed
  useEffect(() => {
    if (!isCallActive) return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: !isMuted
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraError(null);
      } catch (err) {
        console.error('Camera error:', err);
        setCameraError('Unable to access camera. Please grant camera permissions.');
      }
    };

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCallActive, isMuted]);

  // Get real location
  useEffect(() => {
    if (!isCallActive) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.error('Location error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isCallActive]);

  // Get device orientation
  useEffect(() => {
    if (!isCallActive) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null) {
        const alpha = event.alpha;
        const adjustedHeading = (360 - alpha) % 360;
        setHeading(adjustedHeading);
      }
    };

    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission()
        .then((permission: string) => {
          if (permission === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        })
        .catch((err: Error) => console.error(err));
    } else {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [isCallActive]);

  // Calculate bearing
  useEffect(() => {
    if (!currentLocation || !targetCoords) return;

    const calculateBearing = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
      const toRad = (deg: number) => (deg * Math.PI) / 180;
      const toDeg = (rad: number) => (rad * 180) / Math.PI;

      const lat1Rad = toRad(lat1);
      const lng1Rad = toRad(lng1);
      const lat2Rad = toRad(lat2);
      const lng2Rad = toRad(lng2);

      const y = Math.sin(lng2Rad - lng1Rad) * Math.cos(lat2Rad);
      const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
                Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(lng2Rad - lng1Rad);
      
      let brng = toDeg(Math.atan2(y, x));
      return (brng + 360) % 360;
    };

    const newBearing = calculateBearing(
      currentLocation.lat,
      currentLocation.lng,
      targetCoords.latitude,
      targetCoords.longitude
    );
    setBearing(newBearing);
  }, [currentLocation, targetCoords]);

  const handleStartCall = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setIsCallActive(true);
    } catch (err) {
      setCameraError('Camera/microphone access denied. Please enable permissions.');
    }
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    router.push('/profile');
  };

  const arrowRotation = bearing - heading;

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#000'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '16px',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
              color: '#3b82f6',
              padding: '8px'
            }}
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          
          <h1 style={{ 
            margin: 0, 
            fontSize: '18px', 
            fontWeight: 600, 
            flex: 1,
            color: 'white'
          }}>
            Viewing User1's Camera
          </h1>
        </div>
      </div>

      {/* Video Feed */}
      <div style={{ 
        flex: 1, 
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a1a'
      }}>
        {isCallActive ? (
          <>
            {cameraError ? (
              <div style={{
                textAlign: 'center',
                color: '#ef4444',
                padding: '40px'
              }}>
                <p style={{ fontSize: '18px', margin: '0 0 8px 0' }}>⚠️ Camera Error</p>
                <p style={{ fontSize: '14px', margin: 0 }}>{cameraError}</p>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted={isMuted}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                
                {/* AR Overlay */}
                <div style={{
                  position: 'absolute',
                  top: '80px',
                  left: '16px',
                  right: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  {/* Bus Info */}
                  <div style={{
                    backgroundColor: busInfo.color,
                    color: 'white',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                  }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600 }}>
                      Next Bus: {busInfo.nextBus}
                    </p>
                    <p style={{ margin: 0, fontSize: '12px' }}>
                      {busInfo.status}
                    </p>
                  </div>

                  {/* AR Arrow */}
                  {currentLocation && (
                    <div style={{
                      alignSelf: 'center',
                      marginTop: '40px'
                    }}>
                      <div style={{
                        width: '120px',
                        height: '120px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <div style={{
                          fontSize: '100px',
                          color: '#10b981',
                          textShadow: '0 4px 12px rgba(0,0,0,0.5)',
                          transform: `rotate(${arrowRotation}deg)`,
                          transition: 'transform 0.3s ease-out'
                        }}>
                          ↑
                        </div>
                      </div>
                      <p style={{
                        margin: '8px 0 0 0',
                        textAlign: 'center',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: 600,
                        textShadow: '0 2px 8px rgba(0,0,0,0.7)'
                      }}>
                        Walk to Orchard MRT
                      </p>
                    </div>
                  )}
                </div>

                {/* Location Info */}
                {currentLocation && (
                  <>
                    <div style={{
                      position: 'absolute',
                      top: '80px',
                      right: '16px',
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                      padding: '8px 12px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      backdropFilter: 'blur(10px)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <MapPin size={12} />
                      <span>{currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}</span>
                    </div>

                    <div style={{
                      position: 'absolute',
                      top: '120px',
                      right: '16px',
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                      padding: '8px 12px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      backdropFilter: 'blur(10px)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <NavIcon size={12} />
                      <span>{Math.round(heading)}°</span>
                    </div>
                  </>
                )}

                {/* Live Indicator */}
                <div style={{
                  position: 'absolute',
                  bottom: '200px',
                  right: '16px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  animation: 'pulse 2s infinite'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: 'white',
                    borderRadius: '50%'
                  }}></div>
                  Live Camera
                </div>
              </>
            )}
          </>
        ) : (
          <div style={{
            textAlign: 'center',
            color: '#9ca3af',
            padding: '40px'
          }}>
            <Phone size={64} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p style={{ fontSize: '18px', margin: '0 0 8px 0' }}>Camera Feed Inactive</p>
            <p style={{ fontSize: '14px', margin: 0 }}>Start viewing to see live AR navigation</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding: '20px',
        backdropFilter: 'blur(10px)'
      }}>
        {isCallActive ? (
          <div style={{ 
            display: 'flex', 
            gap: '12px',
            justifyContent: 'center'
          }}>
            <button
              onClick={() => router.push('/caregiver-view')}
              style={{
                flex: 1,
                maxWidth: '200px',
                padding: '16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Map size={20} />
              Map Navigation
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              style={{
                padding: '16px',
                backgroundColor: isMuted ? '#ef4444' : '#374151',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>

            <button
              onClick={handleEndCall}
              style={{
                padding: '16px 24px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <PhoneOff size={24} />
              End
            </button>
          </div>
        ) : (
          <button
            onClick={handleStartCall}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: '#10b981',
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
            <Phone size={24} />
            View Live Camera & Navigation
          </button>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}