'use client';

import { useState, useEffect } from 'react';
import { 
  MapPin, Phone, AlertCircle, Navigation, 
  LogOut, User, Clock, Activity
} from 'lucide-react';
import dynamic from 'next/dynamic';

const MapDisplay = dynamic(() => import('./MapDisplay'), { 
  ssr: false, 
  loading: () => <div className="flex items-center justify-center h-full bg-gray-800"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div></div>
});

interface CaregiverDashboardProps {
  caregiverData: any;
  onSignOut: () => void;
}

function CaregiverDashboard({ caregiverData, onSignOut }: CaregiverDashboardProps) {
  // In production, fetch from Firebase/database
  const [patientLocation, setPatientLocation] = useState<{lat: number, lng: number} | null>(null);
  const [patientDestination, setPatientDestination] = useState<any>(null);
  const [patientRoute, setPatientRoute] = useState<[number, number][]>([]);
  const [navStatus, setNavStatus] = useState('Active Navigation');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate patient location updates (in production, use Firebase realtime)
  useEffect(() => {
    // Demo: Use Singapore center as starting point
    setPatientLocation({ lat: 1.3521, lng: 103.8198 });
    setPatientDestination({
      name: 'Punggol MRT Station',
      latitude: 1.405194,
      longitude: 103.902411
    });
    setPatientRoute([
      [1.3521, 103.8198],
      [1.38, 103.85],
      [1.405194, 103.902411]
    ]);

    // Update timestamp every 5 seconds
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleCallPatient = () => {
    // In production, initiate actual call
    alert('Calling patient: 9123 4567');
  };

  const getTimeSinceUpdate = () => {
    const seconds = Math.floor((new Date().getTime() - lastUpdate.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-green-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm opacity-90">Caregiver Mode</p>
              <p className="font-bold">{caregiverData.name}</p>
            </div>
          </div>
          <button
            onClick={onSignOut}
            className="p-2 hover:bg-green-700 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Patient Info Card */}
      <div className="p-4">
        <div className="bg-gray-800 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-gray-400">Monitoring</p>
              <p className="text-xl font-bold">{caregiverData.patientName}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              navStatus === 'Active Navigation' ? 'bg-green-600' : 'bg-gray-600'
            }`}>
              {navStatus}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs">Last Update</span>
              </div>
              <p className="text-sm font-semibold">{getTimeSinceUpdate()}</p>
            </div>

            <div className="bg-gray-700 rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Activity className="w-4 h-4" />
                <span className="text-xs">Status</span>
              </div>
              <p className="text-sm font-semibold text-green-400">On Route</p>
            </div>
          </div>
        </div>

        {/* Current Destination */}
        {patientDestination && (
          <div className="bg-blue-600 rounded-2xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm opacity-90">Going to</p>
                <p className="font-bold text-lg">{patientDestination.name}</p>
              </div>
            </div>
          </div>
        )}

        {/* Alert Section */}
        <div className="bg-gray-800 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <p className="font-semibold">Alerts</p>
          </div>
          <div className="space-y-2">
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Route Progress</p>
                  <p className="text-xs text-gray-400">Patient is on track</p>
                </div>
                <span className="text-green-400 text-sm">✓</span>
              </div>
            </div>
          </div>
        </div>

        {/* Map View */}
        <div className="bg-gray-800 rounded-2xl p-4 mb-4">
          <p className="font-semibold mb-3">Live Location</p>
          <div className="h-[400px] rounded-xl overflow-hidden">
            {patientLocation ? (
              <MapDisplay
                userLat={patientLocation.lat}
                userLng={patientLocation.lng}
                destLat={patientDestination?.latitude}
                destLng={patientDestination?.longitude}
                routePath={patientRoute}
              />
            ) : (
              <div className="h-full bg-gray-700 flex items-center justify-center">
                <p className="text-gray-400">Waiting for patient location...</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleCallPatient}
            className="w-full bg-green-600 hover:bg-green-700 py-4 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            <Phone className="w-5 h-5" />
            Call Patient
          </button>

          <button className="w-full bg-gray-800 hover:bg-gray-700 py-4 rounded-xl font-semibold flex items-center justify-center gap-2">
            <Navigation className="w-5 h-5" />
            View Full Route Details
          </button>
        </div>

        {/* Info Footer */}
        <div className="mt-6 p-4 bg-gray-800 rounded-xl">
          <p className="text-xs text-gray-400 text-center">
            Real-time tracking • Location updates every 5 seconds
          </p>
        </div>
      </div>
    </div>
  );
}

export default CaregiverDashboard;