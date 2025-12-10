'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Navigation, Bus, AlertTriangle, CheckCircle, Search, MapPin, 
  Home as HomeIcon, User, Video, Map as MapIcon, Phone, PhoneCall,
  ArrowLeft, X, ShieldAlert, Loader, Star, Heart, LogOut
} from 'lucide-react';
import dynamic from 'next/dynamic';
import SignIn from './components/SignIn';
import CaregiverDashboard from './components/CareGiverDashboard';

// Dynamically import map to avoid SSR issues
const MapDisplay = dynamic(() => import('./components/MapDisplay'), { 
  ssr: false, 
  loading: () => (
    <div className="flex items-center justify-center h-full w-full bg-gray-800">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
    </div>
  )
});

export default function SmartRouteCare() {
  // ==== AUTHENTICATION STATES ====
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userType, setUserType] = useState<'patient' | 'caregiver' | null>(null);
  const [userData, setUserData] = useState<any>(null);

  // ==== REFS ====
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // ==== VIEW STATES ====
  const [currentView, setCurrentView] = useState<'home' | 'navigation' | 'profile'>('home');
  const [navigationMode, setNavigationMode] = useState<'map' | 'ar'>('map');
  
  // ==== SENSOR STATES ====
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [heading, setHeading] = useState(0);
  const [currentPos, setCurrentPos] = useState<{lat: number, lng: number} | null>(null);
  
  // ==== NAVIGATION STATES ====
  const [destination, setDestination] = useState<{name: string, latitude: number, longitude: number} | null>(null);
  const [bearing, setBearing] = useState(0);
  const [distance, setDistance] = useState(0);
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  const [navInstruction, setNavInstruction] = useState<string>('Select a destination to start');
  const [targetCoords, setTargetCoords] = useState<{latitude: number, longitude: number} | null>(null);
  const [isDirectMode, setIsDirectMode] = useState(false);
  
  // ==== BUS STATES ====
  const [busService, setBusService] = useState<string>('');
  const [busLoad, setBusLoad] = useState<'SEA' | 'SDA' | 'LSD' | null>(null);
  const [nextBusTime, setNextBusTime] = useState('');
  const [loadingBus, setLoadingBus] = useState(false);
  const [busStopCode, setBusStopCode] = useState<string | null>(null);
  
  // ==== SEARCH STATES ====
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // ==== FAVORITES STATES ====
  const [favorites, setFavorites] = useState<any[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  
  // ==== DEMENTIA POINTS STATES ====
  const [dementiaPoints, setDementiaPoints] = useState<any[]>([]);
  const [nearestPoints, setNearestPoints] = useState<any[]>([]);
  const [showDementiaPoints, setShowDementiaPoints] = useState(false);

  // ==== HELPER FUNCTIONS ====
  
  const calculateBearing = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const toDeg = (rad: number) => (rad * 180) / Math.PI;

    const lat1Rad = toRad(lat1);
    const lat2Rad = toRad(lat2);
    const dLng = toRad(lng2 - lng1);

    const y = Math.sin(dLng) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
    
    let brng = toDeg(Math.atan2(y, x));
    return (brng + 360) % 360;
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  // ==== AUTHENTICATION FUNCTIONS ====
  
  const handleSignIn = (type: 'patient' | 'caregiver', data: any) => {
    setUserType(type);
    setUserData(data);
    setIsSignedIn(true);
  };

  const handleSignOut = () => {
    setIsSignedIn(false);
    setUserType(null);
    setUserData(null);
    setCurrentView('home');
  };

  // ==== FAVORITES FUNCTIONS ====
  
  const addToFavorites = (location: any) => {
    // Check if already in favorites
    const exists = favorites.find(f => f.name === location.name);
    if (exists) {
      alert('Already in favorites!');
      return;
    }

    const newFav = {
      id: Date.now(),
      name: location.name,
      latitude: location.latitude,
      longitude: location.longitude
    };
    const updated = [...favorites, newFav];
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
    alert(`Added "${location.name}" to favorites!`);
  };

  const removeFromFavorites = (id: number) => {
    const updated = favorites.filter(f => f.id !== id);
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  // ==== CAMERA & SENSORS ====
  
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 1280, height: 720 }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setPermissionGranted(true);
    } catch (error) {
      console.error('Camera access denied:', error);
      alert('Camera access is required for AR navigation.');
    }
  };

  const startCompass = () => {
    if ('DeviceOrientationEvent' in window) {
      // @ts-ignore
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        // @ts-ignore
        DeviceOrientationEvent.requestPermission()
          .then((response: string) => {
            if (response === 'granted') {
              window.addEventListener('deviceorientation', handleOrientation);
            }
          })
          .catch(console.error);
      } else {
        window.addEventListener('deviceorientation', handleOrientation);
      }
    }
  };

  const handleOrientation = (event: DeviceOrientationEvent) => {
    if (event.alpha !== null) {
      // @ts-ignore
      const compass = event.webkitCompassHeading || Math.abs(event.alpha - 360);
      setHeading(compass);
    }
  };

  const startGPS = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.watchPosition(
        (position) => {
          const newPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentPos(newPos);
          
          if (destination) {
            updateNavigation(newPos.lat, newPos.lng, destination);
          }
        },
        (error) => console.error('GPS Error:', error),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );
    }
  };

  // ==== NAVIGATION WITH API INTEGRATION ====
  
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
        setRoutePath([[currentLat, currentLng], [dest.latitude, dest.longitude]]);
        
        const directBearing = calculateBearing(currentLat, currentLng, dest.latitude, dest.longitude);
        setBearing(directBearing);
        
      } else if (data.latitude) {
        setIsDirectMode(false);
        setTargetCoords({ latitude: data.latitude, longitude: data.longitude });
        
        if (!navInstruction.includes("Take Bus")) {
          setNavInstruction(data.instruction);
        }
        
        if (data.path) {
          setRoutePath(data.path);
        }

        const turnBearing = calculateBearing(currentLat, currentLng, data.latitude, data.longitude);
        setBearing(turnBearing);
      }

      const dist = calculateDistance(currentLat, currentLng, dest.latitude, dest.longitude);
      setDistance(dist);
      
      if (dist < 50) {
        setNavInstruction('🎯 You have arrived!');
      } else if (dist < 200 && !navInstruction.includes("Take Bus")) {
        setNavInstruction(`📍 Arriving soon - ${Math.round(dist)}m ahead`);
      }
      
    } catch (err) {
      console.error("Nav Error", err);
      setIsDirectMode(true);
      setRoutePath([[currentLat, currentLng], [dest.latitude, dest.longitude]]);
    }
  };

  // ==== BUS ROUTE PLANNING ====
  
  const findBestBus = async (destLat: number, destLng: number) => {
    if (!currentPos) return;
    
    try {
      const res = await fetch(
        `/api/route-planner?startLat=${currentPos.lat}&startLng=${currentPos.lng}&destLat=${destLat}&destLng=${destLng}`
      );
      const data = await res.json();
      
      if (data.busService) {
        setBusService(data.busService);
        setBusStopCode(data.boardingStopCode);
        setNavInstruction(`Take Bus ${data.busService} from ${data.boardingStopName}`);
        
        fetchBusData(data.boardingStopCode, data.busService);
      }
    } catch (error) {
      console.error("Bus route planning failed", error);
    }
  };

  // ==== LTA BUS ARRIVAL ====
  
  const fetchBusData = async (stopCode?: string, serviceNo?: string) => {
    const code = stopCode || busStopCode;
    if (!code) return;
    
    setLoadingBus(true);
    try {
      const res = await fetch(`/api/lta/bus-arrival?code=${code}`);
      const data = await res.json();
      
      if (data.Services && data.Services.length > 0) {
        const targetBus = serviceNo 
          ? data.Services.find((s: any) => s.ServiceNo === serviceNo)
          : data.Services[0];
        
        if (targetBus) {
          setBusService(targetBus.ServiceNo);
          setBusLoad(targetBus.NextBus.Load);
          
          const eta = new Date(targetBus.NextBus.EstimatedArrival);
          const now = new Date();
          const diffMins = Math.floor((eta.getTime() - now.getTime()) / 60000);
          setNextBusTime(diffMins > 0 ? `${diffMins} min` : 'Arriving');
          
          if (targetBus.NextBus.Load === 'LSD' && navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
          }
        }
      }
    } catch (err) {
      console.error("Bus fetch failed", err);
    }
    setLoadingBus(false);
  };

  // ==== EMERGENCY SAFE POINT ROUTING ====
  
  const handleEmergencyReroute = async () => {
    if (!currentPos) return;
    
    try {
      const res = await fetch(`/api/find-safe-point?lat=${currentPos.lat}&lng=${currentPos.lng}`);
      const data = await res.json();
      
      if (data.name) {
        setDestination({
          name: data.name,
          latitude: data.latitude,
          longitude: data.longitude
        });
        setNavInstruction(`🚨 Rerouting to ${data.name}`);
        setCurrentView('navigation');
      }
    } catch (error) {
      console.error("Emergency reroute failed", error);
    }
  };

  // ==== LOCATION SEARCH ====
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error("Search failed", error);
    }
    setIsSearching(false);
  };

  const selectSearchResult = (result: any) => {
    const lat = parseFloat(result.LATITUDE);
    const lng = parseFloat(result.LONGITUDE);
    
    setDestination({
      name: result.SEARCHVAL,
      latitude: lat,
      longitude: lng
    });
    setSearchQuery(result.SEARCHVAL);
    setSearchResults([]);
    
    findBestBus(lat, lng);
  };

  // ==== START NAVIGATION ====
  
  const startNavigation = (dest: {name: string, latitude: number, longitude: number}) => {
    setDestination(dest);
    setShowDementiaPoints(false);
    setShowFavorites(false);
    
    if (currentPos) {
      setRoutePath([
        [currentPos.lat, currentPos.lng],
        [dest.latitude, dest.longitude]
      ]);
      
      const newBearing = calculateBearing(
        currentPos.lat, currentPos.lng,
        dest.latitude, dest.longitude
      );
      setBearing(newBearing);
      
      const dist = calculateDistance(
        currentPos.lat, currentPos.lng,
        dest.latitude, dest.longitude
      );
      setDistance(dist);
      
      setNavInstruction(`🚶 Head towards ${dest.name}`);
    }
    
    setCurrentView('navigation');
    findBestBus(dest.latitude, dest.longitude);
  };

  // ==== BUS STATUS HELPERS ====
  
  const getBusStatusColor = () => {
    if (busLoad === 'SEA') return 'bg-green-600';
    if (busLoad === 'SDA') return 'bg-orange-500';
    if (busLoad === 'LSD') return 'bg-red-600';
    return 'bg-gray-700';
  };

  const getBusStatusText = () => {
    if (busLoad === 'SEA') return 'Air Space Available - OK';
    if (busLoad === 'SDA') return 'Standing Only';
    if (busLoad === 'LSD') return 'CROWDED - WAIT';
    return 'Checking...';
  };

  // ==== LIFECYCLE ====
  
  useEffect(() => {
    startGPS();
    startCompass();
    
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }

    // Load dementia points
    const loadDementiaPoints = async () => {
      try {
        const { dementiaPoints } = await import('./data/dementiaPoints');
        setDementiaPoints(dementiaPoints);
      } catch (error) {
        console.error('Failed to load dementia points:', error);
      }
    };
    loadDementiaPoints();
    
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  useEffect(() => {
    if (navigationMode === 'ar' && currentView === 'navigation') {
      startCamera();
    }
  }, [navigationMode, currentView]);

  useEffect(() => {
    if (currentView === 'navigation' && busStopCode) {
      const interval = setInterval(() => {
        fetchBusData();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [currentView, busStopCode]);

  // Calculate nearest dementia points when position changes
  useEffect(() => {
    if (currentPos && dementiaPoints.length > 0) {
      const withDistances = dementiaPoints.map(point => ({
        ...point,
        distance: calculateDistance(currentPos.lat, currentPos.lng, point.lat, point.lng)
      }));
      
      const nearest = withDistances
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 5);
      
      setNearestPoints(nearest);
    }
  }, [currentPos, dementiaPoints]);

  // ==== RENDER ====
  
  // Show sign-in screen if not signed in
  if (!isSignedIn) {
    return <SignIn onSignIn={handleSignIn} />;
  }

  // Show caregiver dashboard if caregiver
  if (userType === 'caregiver') {
    return <CaregiverDashboard caregiverData={userData} onSignOut={handleSignOut} />;
  }

  const arrowRotation = bearing - heading;

  // ==================== HOME VIEW ====================
  if (currentView === 'home') {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <Navigation className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">SmartRoute Care</h1>
              <p className="text-xs text-gray-400">Patient: {userData?.name}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setCurrentView('home')}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <HomeIcon className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setCurrentView('profile')}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <User className="w-6 h-6" />
            </button>
            <button 
              onClick={handleSignOut}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Government Banner */}
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 mb-4 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-red-300 font-semibold">A Singapore Government Agency Website</p>
            <button className="text-blue-400 underline text-xs mt-1">How to identify →</button>
          </div>
        </div>

        {/* Location Display */}
        <div className="mb-4">
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-3 mb-3">
            <MapPin className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Your Location"
              value={currentPos ? `${currentPos.lat.toFixed(4)}, ${currentPos.lng.toFixed(4)}` : 'Getting location...'}
              className="bg-transparent flex-1 outline-none text-sm"
              readOnly
            />
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative mb-3">
            <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-3">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Where to?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent flex-1 outline-none text-sm"
              />
              {isSearching && <Loader className="w-5 h-5 animate-spin text-blue-500" />}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto">
                {searchResults.map((result, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectSearchResult(result)}
                    className="w-full p-4 text-left hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-0"
                  >
                    <p className="font-medium">{result.SEARCHVAL}</p>
                    <p className="text-sm text-gray-400">{result.ADDRESS}</p>
                  </button>
                ))}
              </div>
            )}
          </form>

          {/* Favorites Section */}
          {favorites.length > 0 && (
            <div className="mb-3">
              <button
                onClick={() => setShowFavorites(!showFavorites)}
                className="w-full flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg p-3 transition-colors"
              >
                <Star className="w-5 h-5" />
                <span className="flex-1 text-left text-sm font-semibold">
                  My Favorite Places ({favorites.length})
                </span>
                <span className="text-white">{showFavorites ? '▲' : '▼'}</span>
              </button>

              {showFavorites && (
                <div className="mt-2 bg-gray-800 rounded-lg overflow-hidden">
                  {favorites.map((fav) => (
                    <div key={fav.id} className="flex items-center justify-between p-3 border-b border-gray-700 last:border-0">
                      <button
                        onClick={() => startNavigation(fav)}
                        className="flex-1 text-left hover:text-blue-400 transition-colors"
                      >
                        <p className="font-medium">{fav.name}</p>
                        <p className="text-xs text-gray-400">Tap to navigate</p>
                      </button>
                      <button
                        onClick={() => removeFromFavorites(fav.id)}
                        className="p-2 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Nearest Dementia Point Button */}
          <button
            onClick={() => setShowDementiaPoints(!showDementiaPoints)}
            className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700 rounded-lg p-3 mb-3 transition-colors"
          >
            <MapPin className="w-5 h-5" />
            <span className="flex-1 text-left text-sm font-semibold">
              Nearest Dementia Point
            </span>
            <span className="text-white">{showDementiaPoints ? '▲' : '▼'}</span>
          </button>

          {/* Show Nearest Dementia Points */}
          {showDementiaPoints && nearestPoints.length > 0 && (
            <div className="mb-3 bg-gray-800 rounded-lg overflow-hidden">
              <div className="p-3 border-b border-gray-700 bg-blue-600">
                <p className="text-sm font-semibold">5 Nearest Safe Points</p>
              </div>
              {nearestPoints.map((point, idx) => (
                <button
                  key={idx}
                  onClick={() => startNavigation({
                    name: point.name,
                    latitude: point.lat,
                    longitude: point.lng
                  })}
                  className="w-full p-4 text-left hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-0"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{point.name}</p>
                      <p className="text-xs text-gray-400 mt-1">{point.address}</p>
                    </div>
                    <span className="text-blue-400 text-sm font-semibold ml-2">
                      {(point.distance / 1000).toFixed(1)} km
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {showDementiaPoints && nearestPoints.length === 0 && (
            <div className="mb-3 bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-gray-400">
                {currentPos ? 'Loading safe points...' : 'Waiting for GPS location...'}
              </p>
            </div>
          )}
        </div>

        {/* Add to Favorites Button (if destination selected) */}
        {destination && !favorites.find(f => f.name === destination.name) && (
          <button
            onClick={() => addToFavorites(destination)}
            className="w-full bg-yellow-600 hover:bg-yellow-700 py-2 rounded-lg text-sm font-semibold mb-3 flex items-center justify-center gap-2 transition-colors"
          >
            <Star className="w-4 h-4" />
            Save "{destination.name}" as Favorite
          </button>
        )}

        {/* Map Display */}
        <div className="h-[400px] mb-6 rounded-2xl overflow-hidden">
          {currentPos ? (
            <MapDisplay
              userLat={currentPos.lat}
              userLng={currentPos.lng}
              destLat={destination?.latitude}
              destLng={destination?.longitude}
              routePath={routePath}
            />
          ) : (
            <div className="h-full bg-gray-800 flex items-center justify-center rounded-2xl">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p>Loading map...</p>
              </div>
            </div>
          )}
        </div>

        {/* Start Navigation Button */}
        <button
          onClick={() => destination && startNavigation(destination)}
          disabled={!destination}
          className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all ${
            destination 
              ? 'bg-blue-600 hover:bg-blue-700 active:scale-95' 
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Navigation className="w-6 h-6" />
          {destination ? `Navigate to ${destination.name}` : 'Select a destination first'}
        </button>
      </div>
    );
  }

  // ==================== NAVIGATION VIEW ====================
  if (currentView === 'navigation') {
    return (
      <div className="h-screen w-screen bg-black relative overflow-hidden">
        {/* Back Button */}
        <button
          onClick={() => setCurrentView('home')}
          className="absolute top-6 left-4 z-20 bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2 flex items-center gap-2 shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold">Back</span>
        </button>

        {/* Title */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20 bg-gray-900/80 backdrop-blur rounded-lg px-4 py-2">
          <p className="text-sm font-semibold text-white">Beginning Navigation</p>
        </div>

        {/* Emergency Button */}
        <button
          onClick={handleEmergencyReroute}
          className="absolute top-20 right-4 z-20 bg-red-600 hover:bg-red-700 rounded-full p-3 shadow-lg animate-pulse"
          title="Emergency: Go to nearest safe point"
        >
          <ShieldAlert className="w-6 h-6 text-white" />
        </button>

        {/* AR Camera View (Full Screen) */}
        {navigationMode === 'ar' ? (
          <div className="absolute inset-0">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            
            {/* AR Overlay - Direction Arrow */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="relative"
                style={{
                  transform: `rotate(${arrowRotation}deg)`,
                  transition: 'transform 0.3s ease-out'
                }}
              >
                <div className="w-32 h-32 flex items-center justify-center">
                  <div className="absolute w-0 h-0 border-l-[50px] border-r-[50px] border-b-[100px] border-l-transparent border-r-transparent border-b-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]" />
                </div>
              </div>
            </div>

            {/* Bus Information Banner */}
            {busService && busLoad && (
              <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-10">
                <div className={`${getBusStatusColor()} text-white px-6 py-3 rounded-lg shadow-xl`}>
                  <p className="font-bold text-lg">Next Bus: {busService}</p>
                  <p className="text-sm">{getBusStatusText()}</p>
                  {nextBusTime && <p className="text-xs mt-1">ETA: {nextBusTime}</p>}
                </div>
              </div>
            )}

            {/* Distance Info */}
            {destination && distance > 50 && (
              <div className="absolute top-44 left-1/2 transform -translate-x-1/2 z-10 bg-blue-600/90 text-white px-4 py-2 rounded-lg">
                <p className="text-sm">{Math.round(distance)}m to {destination.name}</p>
              </div>
            )}
          </div>
        ) : (
          // Map View (Full Screen)
          <div className="absolute inset-0">
            {currentPos && (
              <MapDisplay
                userLat={currentPos.lat}
                userLng={currentPos.lng}
                destLat={destination?.latitude}
                destLng={destination?.longitude}
                routePath={routePath}
              />
            )}
            
            {/* Navigation Info Overlay */}
            <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-10 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-xl max-w-xs text-center">
              <p className="text-sm font-semibold">
                {destination ? destination.name : 'Select destination'}
              </p>
              {distance > 0 && (
                <p className="text-xs mt-1">{Math.round(distance)}m away</p>
              )}
              {busService && (
                <p className="text-xs mt-1">Bus {busService} • {nextBusTime}</p>
              )}
            </div>
          </div>
        )}

        {/* Bottom Control Panel */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent pt-20 pb-8 px-4 z-10">
          {/* Toggle View Button */}
          <button
            onClick={() => setNavigationMode(navigationMode === 'ar' ? 'map' : 'ar')}
            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-semibold mb-3 flex items-center justify-center gap-2"
          >
            {navigationMode === 'ar' ? (
              <>
                <MapIcon className="w-5 h-5" />
                Map Navigation
              </>
            ) : (
              <>
                <Video className="w-5 h-5" />
                Live Camera Navigation
              </>
            )}
          </button>

          {/* Call Caregiver Button */}
          <button 
            onClick={() => alert(`Calling ${userData?.caregiverName}: ${userData?.caregiverPhone}`)}
            className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            <PhoneCall className="w-5 h-5" />
            Call Caregiver
          </button>
        </div>
      </div>
    );
  }

  // ==================== PROFILE VIEW ====================
  if (currentView === 'profile') {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <Navigation className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold">SmartRoute Care</h1>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setCurrentView('home')}
              className="p-2 hover:bg-gray-800 rounded-lg"
            >
              <HomeIcon className="w-6 h-6" />
            </button>
            <button className="p-2 bg-gray-800 rounded-lg">
              <User className="w-6 h-6" />
            </button>
            <button 
              onClick={handleSignOut}
              className="p-2 hover:bg-gray-800 rounded-lg"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-gray-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{userData?.name}</h2>
              <p className="text-gray-400">Patient Profile</p>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="bg-white rounded-lg p-4 mb-6">
            <div className="w-32 h-32 mx-auto bg-gray-200 flex items-center justify-center">
              <p className="text-gray-500 text-xs text-center">QR Code<br/>Placeholder</p>
            </div>
            <p className="text-center text-gray-600 text-sm mt-2">Membership no: {userData?.id}</p>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
            
            <div>
              <p className="text-gray-400 text-sm">Phone No:</p>
              <p className="font-medium">{userData?.phone}</p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">NRIC No:</p>
              <p className="font-medium">{userData?.nric}</p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Caregiver Name:</p>
              <p className="font-medium">{userData?.caregiverName}</p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Caregiver Phone No:</p>
              <p className="font-medium">{userData?.caregiverPhone}</p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Home Address:</p>
              <p className="font-medium">{userData?.address}</p>
            </div>
          </div>
        </div>

        {/* Emergency Contact Button */}
        <button 
          onClick={() => alert(`Emergency call to ${userData?.caregiverName}: ${userData?.caregiverPhone}`)}
          className="w-full bg-red-600 hover:bg-red-700 py-4 rounded-xl font-semibold flex items-center justify-center gap-2"
        >
          <Phone className="w-6 h-6" />
          Emergency Contact
        </button>
      </div>
    );
  }

  return null;
}