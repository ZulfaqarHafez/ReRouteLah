// src/components/CaregiverInterface.tsx (MERGED CODE)
'use client';

import { useState, useEffect, useCallback } from "react";
import { Bell, MapPin, Settings, Phone, AlertTriangle, UserPlus, Users, LogOut, ArrowLeft, Video, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CaregiverInfo, PatientInfo, SavedDestination } from "@/types";
import { toast } from "@/hooks/use-toast";
import PatientStatusCard from "./PatientStatusCard";
import DeviationAlert from "./DeviationAlert";
import LiveLocationBanner from "./LiveLocationBanner";
import DestinationManager from "./DestinationManager";
import LinkPatientDialog from "./LinkPatientDialog";
// 🔴 REMOVED: useSimulatedLocationTracking import (belongs on patient side)
import { useAuth } from "@/contexts/AuthContext";

// 争 CRITICAL FIX: Use dynamic import to prevent SSR crash 
import dynamic from 'next/dynamic';
const DynamicMapDisplay = dynamic(() => import('./MapDisplay'), {
  ssr: false, // Disables server-side rendering
  loading: () => <div className="h-full w-full flex items-center justify-center text-muted-foreground">Loading Map...</div>
});

interface CaregiverInterfaceProps {
  caregiver: CaregiverInfo;
  activePatient: PatientInfo | null;
  patientDestination: SavedDestination | null;
}

type CaregiverView = "dashboard" | "map" | "destinations" | "camera";

const CaregiverInterface = ({
  caregiver,
  activePatient,
  patientDestination
}: CaregiverInterfaceProps) => {
  // 🟢 MERGED: Get caregiverData from AuthContext to check all patients' status
  const { logout, caregiverData } = useAuth();
  const [view, setView] = useState<CaregiverView>("dashboard");
  const [selectedPatientForDestinations, setSelectedPatientForDestinations] = useState<PatientInfo | null>(null);
  const [dismissedAlertPatientId, setDismissedAlertPatientId] = useState<string | null>(null);
  
  // 🟢 MERGED: Use state for map center location (Caregiver's location)
  const [caregiverLocation, setCaregiverLocation] = useState<[number, number]>(
    activePatient?.currentLocation || [1.3521, 103.8198]
  );
  const [selectedPatientForMap, setSelectedPatientForMap] = useState<PatientInfo | null>(activePatient);

  // 泙 Get real device location for map fallback
  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setCaregiverLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.log("Could not get location, using default:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // 🟢 MERGED: Derive the currently deviated patient from global state
  const deviatedPatient = caregiverData?.patients.find((p) => p.isDeviated);

  // Reset dismissed alert when patient returns to route
  useEffect(() => {
    if (!deviatedPatient && dismissedAlertPatientId) {
      setDismissedAlertPatientId(null);
    }
  }, [deviatedPatient, dismissedAlertPatientId]);

  // 🟢 MERGED: Handle Dismiss (Acknowledge alert and hide it)
  const handleDismissAlert = () => {
    if (deviatedPatient) {
      setDismissedAlertPatientId(deviatedPatient.id);
    }
    toast({
      title: "Alert dismissed",
      description: "You can view the patient's status on the dashboard.",
    });
  };

  const handleViewOnMap = () => {
    // 🟢 MERGED: If there's a deviated patient, always focus map on them
    if (deviatedPatient) {
      setSelectedPatientForMap(deviatedPatient);
    } else if (activePatient) {
      setSelectedPatientForMap(activePatient);
    }
    setView("map");
  };

  // 🟢 MERGED: Robust Call Logic (Prioritizes the deviated patient)
  const handleCallPatient = () => {
    // Priority: 1. Deviated Patient, 2. Active Patient, 3. First Patient in the list
    const patientToCall = deviatedPatient || activePatient || caregiver?.patients?.[0];
    const phone = patientToCall?.profile?.phone;

    if (phone) {
      window.location.href = `tel:${phone}`;
      toast({
        title: "Calling traveler...",
        description: `Attempting to contact ${patientToCall?.name || "traveler"}.`,
      });
    } else {
      toast({
        title: "Phone number not available",
        description: "No contact number is linked to this traveler.",
        variant: "destructive",
      });
    }
  };

  const renderContent = () => {
    // Determine the patient whose data should be displayed on the map/status
    const patientInFocus = selectedPatientForMap || activePatient || deviatedPatient || caregiver.patients[0];
    
    switch (view) {
      case "camera":
        return (
          <div className="h-[calc(100vh-80px)] space-y-4 flex flex-col pb-24">
             <div className="flex items-center justify-between">
                <Button variant="outline" onClick={() => setView("dashboard")} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
                <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-600 rounded-full animate-pulse">
                    <div className="w-2 h-2 bg-red-600 rounded-full" />
                    <span className="text-xs font-bold uppercase">Live Feed</span>
                </div>
             </div>
             
             <div className="flex-1 bg-black rounded-2xl overflow-hidden relative shadow-2xl border-4 border-slate-800">
                {/* Simulated Video Feed - Using a static image for prototype */}
                <img 
                  src="https://images.unsplash.com/photo-1517503733527-00e356b7498f?q=80&w=2070&auto=format&fit=crop" 
                  alt="Live Camera Feed" 
                  className="w-full h-full object-cover opacity-80"
                />
                
                {/* AR Overlay Simulation on Caregiver side */}
                <div className="absolute top-4 left-4 right-4 flex justify-between text-white drop-shadow-md">
                    <span className="font-mono text-sm">{activePatient?.name}'s View</span>
                    <span className="font-mono text-sm">Battery: 78%</span>
                </div>

                <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                    <div className="bg-black/50 backdrop-blur-md text-white px-6 py-3 rounded-xl border border-white/20">
                        <p className="font-semibold">Approaching: Bus Stop 12345</p>
                    </div>
                </div>
             </div>

             <div className="p-4 bg-card rounded-xl border border-border">
                <h3 className="font-semibold mb-2">Camera Controls</h3>
                <div className="flex gap-2">
                    <Button variant="outline" className="w-full" onClick={() => toast({ title: "Snapshot taken", description: "Saved to gallery" })}>
                        <Camera className="h-4 w-4 mr-2" /> Snapshot
                    </Button>
                </div>
             </div>

             {/* Fixed Call Button at Bottom */}
             <div className="fixed bottom-6 left-0 right-0 px-4 flex justify-center z-[9999]">
                <Button 
                  className="w-full max-w-md h-14 text-lg font-bold rounded-2xl bg-green-600 hover:bg-green-700 text-white shadow-xl"
                  onClick={handleCallPatient}
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Call {activePatient?.name || "Traveler"}
                </Button>
            </div>
          </div>
        );

      case "destinations":
        if (selectedPatientForDestinations) {
          return (
            <DestinationManager
              patient={selectedPatientForDestinations}
            />
          );
        }
        return (
          <div className="space-y-6">
            <Button variant="outline" onClick={() => setView("dashboard")} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
            </Button>
            <h2 className="text-2xl font-bold">Manage Destinations</h2>
            <p className="text-muted-foreground">Select a traveler to manage their saved places.</p>
            {caregiver.patients.map((patient) => (
              <Button
                key={patient.id}
                onClick={() => setSelectedPatientForDestinations(patient)}
                className="w-full justify-start h-14 bg-accent/50 hover:bg-accent/70 text-foreground"
                variant="soft"
              >
                <Users className="h-5 w-5 mr-3" />
                Manage {patient.name}'s Places
              </Button>
            ))}
            <LinkPatientDialog />
          </div>
        );

      case "map":
        return (
          <div className="relative h-[calc(100vh-80px)] pb-24 space-y-4">
            {/* Sticky Back Button - appears above deviation alert */}
            <div className="sticky top-0 z-[101] bg-background/95 backdrop-blur-sm pb-3">
              <Button
                variant="outline"
                onClick={() => setView("dashboard")}
                className="gap-2 shadow-lg hover:shadow-xl transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>

            <LiveLocationBanner
              patientName={patientInFocus?.name || "Traveler"}
              isNavigating={patientInFocus?.isNavigating || false}
              // 🟢 MERGED: Use the actual patient's deviation status
              isDeviated={patientInFocus?.isDeviated || false} 
              lastUpdated={new Date()}
            />
            {/* 争 CRITICAL: Use the dynamic component here */}
            <div className="h-5/6 shadow-2xl rounded-xl overflow-hidden">
              <DynamicMapDisplay
                // 🟢 MERGED: Use the focused patient's location or the caregiver's location
                userLat={patientInFocus?.currentLocation?.[0] ?? caregiverLocation[0]} 
                userLng={patientInFocus?.currentLocation?.[1] ?? caregiverLocation[1]}
                destLat={patientDestination?.coordinates?.[0]}
                destLng={patientDestination?.coordinates?.[1]}
              />
            </div>

            {/* Fixed Call Button at Bottom */}
            <div className="fixed bottom-6 left-0 right-0 px-4 flex justify-center z-[9999]">
                <Button 
                  className="w-full max-w-md h-14 text-lg font-bold rounded-2xl bg-green-600 hover:bg-green-700 text-white shadow-xl"
                  onClick={handleCallPatient}
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Call {patientInFocus?.name || "Traveler"}
                </Button>
            </div>
          </div>
        );

      case "dashboard":
      default:
        return (
          <div className="space-y-6">
            <LiveLocationBanner
              patientName={activePatient?.name || "Traveler"}
              isNavigating={activePatient?.isNavigating || false}
              // 🟢 MERGED: Use the actual patient's deviation status
              isDeviated={activePatient?.isDeviated || false} 
              lastUpdated={new Date()}
            />
            
            <LinkPatientDialog />

            {/* Traveler Status Card */}
            {activePatient && (
              <PatientStatusCard
                patient={activePatient}
                destination={patientDestination}
                onViewOnMap={handleViewOnMap}
                // 🟢 MERGED: Use the actual patient's deviation status
                isDeviated={activePatient?.isDeviated || false} 
              />
            )}

            {/* Quick Actions */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Quick Actions</h3>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2 rounded-2xl"
                  onClick={handleViewOnMap}
                >
                  <MapPin className="h-6 w-6" />
                  <span className="text-xs">View Location</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2 rounded-2xl"
                  onClick={() => setView("camera")}
                  disabled={!activePatient}
                >
                  <Video className="h-6 w-6" />
                  <span className="text-xs">Live Camera</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2 rounded-2xl"
                  onClick={() => {
                    setSelectedPatientForDestinations(activePatient || null);
                    setView("destinations");
                  }}
                >
                  <Settings className="h-6 w-6" />
                  <span className="text-xs">Manage Places</span>
                </Button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen pb-8 pt-4">
      
      {/* 🟢 MERGED: GLOBAL DEVIATION ALERT (shows only if not dismissed) */}
      {deviatedPatient && deviatedPatient.id !== dismissedAlertPatientId && (
        <DeviationAlert
          patient={deviatedPatient}
          deviationDistance={deviatedPatient.deviationDistance}
          onDismiss={handleDismissAlert}
          onViewOnMap={() => {
            setSelectedPatientForMap(deviatedPatient);
            setView("map");
            handleDismissAlert();
          }}
          onCallPatient={handleCallPatient}
        />
      )}

      <div className="px-4">
        {renderContent()}
      </div>
    </div>
  );
};

export default CaregiverInterface;