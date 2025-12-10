'use client';

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, User, Volume2, VolumeX, CheckCircle, LogOut, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SavedDestination, PatientInfo } from "@/types/index";
import DestinationCard from "./DestinationCard";
import CallGuardianButton from "./CallGuardianButton";
import EmergencyButton from "./EmergencyButton";
import BusArrivalCard from "./BusArrivalCard";
import MRTArrivalCard from "./MRTArrivalCard";
import PatientProfilePage from "./PatientProfilePage";
import NavigationStepCard from "./NavigationStepCard";
import PairingCodeCard from "./PairingCodeCard";
import { useVoiceNavigation } from "@/hooks/useVoiceNavigation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import ARNavigation from "./ARNavigation";
// 🟢 MERGED: Import for deviation tracking logic
import { useSimulatedLocationTracking } from "@/hooks/useLocationTracking";
import { findNearestSafePoint } from "@/services/safePointsService"; 

interface PatientInterfaceProps {
  patient: PatientInfo;
  onNavigationStart?: (destination: SavedDestination) => void;
}

type AppView = "home" | "navigation" | "profile";

interface NavigationStep {
  id: number;
  direction: "straight" | "left" | "right" | "bus" | "mrt" | "destination";
  instruction: string;
  distance?: string;
  coordinates?: [number, number]; //  Added coordinates for AR
}

const PatientInterface = ({ patient, onNavigationStart }: PatientInterfaceProps) => {
  // 🟢 MERGED: Get updateNavigationStatus from context
  const { logout, updateNavigationStatus, notifyDestinationSelected } = useAuth();
  const [appView, setAppView] = useState<AppView>("home");
  const [selectedDestination, setSelectedDestination] = useState<SavedDestination | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const { speak, speakStep, stop, isSpeaking } = useVoiceNavigation({ rate: 0.85 });
  
  // AR State
  const [showAR, setShowAR] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<[number, number]>(
    patient?.currentLocation || [1.3521, 103.8198] // 🟢 Added optional chaining to prevent crash on logout
  );
  
  // 泙 State for dynamic route generation
  const [navigationSteps, setNavigationSteps] = useState<NavigationStep[]>([]);
  const [routePath, setRoutePath] = useState<[number, number][]>([]);

  // 🟢 MERGED: Simulated tracking hook (drives deviation + live location)
  const {
    currentLocation: simulatedLocation,
    isDeviated,
    deviationDistance,
    startTracking,
    stopTracking,
    triggerDeviation // 🟢 Uncommented to use directly
  } = useSimulatedLocationTracking(
    currentLocation, 
    selectedDestination?.coordinates // Destination is dynamic
  );

  // 🟢 MERGED: Start/stop tracking based on navigation view
  useEffect(() => {
    const isNavigatingView = appView === "navigation" || appView === "ar-guide";

    if (isNavigatingView) {
        // Start simulation when navigating
        startTracking();
    } else {
        // If not navigating, stop tracking
        stopTracking();
    }
  }, [appView, startTracking, stopTracking]);

  // 🟢 Update current location from simulated location when navigating
  useEffect(() => {
    const isNavigatingView = appView === "navigation" || appView === "ar-guide";
    if (isNavigatingView && simulatedLocation) {
        setCurrentLocation(simulatedLocation);
    }
  }, [simulatedLocation, appView]);

  // 🟢 Use real device location when not navigating
  useEffect(() => {
    const isNavigatingView = appView === "navigation" || appView === "ar-guide";
    if (!isNavigatingView && "geolocation" in navigator) {
        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                setCurrentLocation([position.coords.latitude, position.coords.longitude]);
            },
            (error) => {
                console.warn("GPS not available:", error.message);
                // Keep using the last known location or default
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
        return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [appView]);


  // 🟢 MERGED: Sync navigation status (including deviation) to AuthContext for caregiver view
  const patientId = patient?.id; // Extract ID for stable dependency
  useEffect(() => {
    if (!patientId || !currentLocation || !updateNavigationStatus) return;
    
    // Only update navigation status if we are actually navigating or just stopped
    const isNavigatingView = appView === "navigation" || appView === "ar-guide";
    
    updateNavigationStatus(
      patientId,
      isNavigatingView, 
      isDeviated, // <--- Reports deviation status
      deviationDistance, // <--- Reports deviation distance
      currentLocation
    );
  }, [patientId, currentLocation, appView, isDeviated, deviationDistance, updateNavigationStatus]);

  const handleSwitchRole = () => {
    // 🟢 CHANGED: Removed stopTracking() to persist deviation state
    // This ensures the deviation status remains "true" in AuthContext
    // so the caregiver receives the alert upon login.
    stop();
    
    logout();
    toast({
      title: "Logged out",
      description: "You can now select a different role",
    });
  };

  // Use patient's destinations from auth context (managed by caregiver)
  const destinations = patient?.destinations || []; // 🟢 Added optional chaining

  // 🆘 Emergency handler: Find nearest safe point and auto-navigate
  const handleEmergency = async () => {
    try {
      toast({
        title: "Finding safe location...",
        description: "Searching for nearest Dementia Go-To Point",
      });

      const safePoint = await findNearestSafePoint(currentLocation);

      if (!safePoint) {
        toast({
          title: "No safe location found",
          description: "Unable to find nearby dementia-friendly location. Please call your guardian.",
          variant: "destructive",
        });
        return;
      }

      // Convert SafePoint to SavedDestination format
      const destination: SavedDestination = {
        id: safePoint.id,
        name: safePoint.name,
        address: safePoint.address,
        coordinates: safePoint.coordinates,
        icon: '🛡️', // Safe point icon
      };

      // Automatically start navigation to safe point
      await handleDestinationSelect(destination);

      toast({
        title: "Navigating to safe location",
        description: `Routing you to ${safePoint.name}`,
      });
    } catch (error) {
      console.error('Emergency routing error:', error);
      toast({
        title: "Error",
        description: "Failed to find safe location. Please call your guardian.",
        variant: "destructive",
      });
    }
  };

  const handleDestinationSelect = async (destination: SavedDestination) => {
    setSelectedDestination(destination);
    setAppView("navigation");
    setCurrentStepIndex(0);

    // 🚨 Notify caregiver that patient selected a destination
    if (patient?.id && notifyDestinationSelected) {
      await notifyDestinationSelected(patient.id, destination);
    }

    const start = currentLocation;
    const end = destination.coordinates;
    
    let newSteps: NavigationStep[] = [];
    let newPath: [number, number][] = [];

    // 1. Try fetching from internal API (LTA/OneMap wrapper)
    try {
      const apiResponse = await fetch('/api/route-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start, end, destination: destination.name })
      });

      if (apiResponse.ok) {
        const data = await apiResponse.json();
        if (data.steps && data.path) {
          newSteps = data.steps;
          newPath = data.path;
        }
      }
    } catch (e) {
      console.log("Internal route planner not available, falling back to OSRM");
    }

    // 2. Fallback to OSRM with smart processing if API failed
    if (newSteps.length === 0) {
      try {
        // 🚶 ENHANCED: Use foot-walking profile with additional safety parameters
        // - foot: Strictly pedestrian paths (sidewalks, footpaths, crosswalks) - NO ROADS
        // - steps=true: Get turn-by-turn directions
        // - continue_straight=true: Prefer continuing straight at intersections (safer for dementia patients)
        // - annotations=true: Get additional route metadata
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/foot/${start[1]},${start[0]};${end[1]},${end[0]}?steps=true&geometries=geojson&overview=full&continue_straight=true&annotations=true`
        );

        const data = await response.json();

        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const totalDistance = route.distance; // in meters

          newPath = route.geometry.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number]);
          
          const allSteps: NavigationStep[] = route.legs[0].steps.map((step: any, index: number) => {
            let direction: NavigationStep['direction'] = "straight";
            const modifier = step.maneuver.modifier;
            
            if (modifier && modifier.includes("left")) direction = "left";
            else if (modifier && modifier.includes("right")) direction = "right";
            else if (step.maneuver.type === "arrive") direction = "destination";

            let instruction = step.maneuver.type;
            const name = step.name || "path";
            
            if (step.maneuver.type === "turn") instruction = `Turn ${modifier ? modifier.replace("_", " ") : ""} onto ${name}`;
            else if (step.maneuver.type === "depart") instruction = `Head ${modifier || "towards"} ${name}`;
            else if (step.maneuver.type === "arrive") instruction = "You have arrived";
            else instruction = `${step.maneuver.type} onto ${name}`;

            return {
              id: index + 1,
              direction,
              instruction: instruction.charAt(0).toUpperCase() + instruction.slice(1),
              distance: step.distance < 1000 ? `${Math.round(step.distance)}m` : `${(step.distance / 1000).toFixed(1)}km`,
              coordinates: [step.maneuver.location[1], step.maneuver.location[0]] as [number, number]
            };
          });

          // 泙 Logic: If distance > 1.5km, generate SPECIFIC Public Transport instructions
          if (totalDistance > 1500) {
            // Find split points (first 400m, last 400m)
            let startIdx = 0, endIdx = allSteps.length - 1;
            let d = 0;
            for(let i=0; i<route.legs[0].steps.length; i++) { d+=route.legs[0].steps[i].distance; if(d>400) { startIdx=i; break; } }
            d=0;
            for(let i=route.legs[0].steps.length-1; i>=0; i--) { d+=route.legs[0].steps[i].distance; if(d>400) { endIdx=i; break; } }
            
            if (startIdx >= endIdx) { startIdx = Math.floor(allSteps.length/3); endIdx = Math.floor(allSteps.length*2/3); }

            const startSegment = allSteps.slice(0, startIdx + 1);
            const endSegment = allSteps.slice(endIdx);
            
            // Extract street names for realistic instructions
            const startRoad = route.legs[0].steps[startIdx]?.name || "Main Road";
            const endRoad = route.legs[0].steps[endIdx]?.name || "Destination Road";
            const isMRT = totalDistance > 5000;
            
            const transitSteps: NavigationStep[] = [];
            
            if (isMRT) {
               transitSteps.push({
                 id: 0, direction: "straight",
                 instruction: `Walk to ${startRoad} MRT Station`,
                 distance: "5 mins", coordinates: allSteps[startIdx].coordinates
               });
               transitSteps.push({
                 id: 0, direction: "mrt", // 🚇 FIXED: Use "mrt" not "bus" for MRT
                 instruction: `Take MRT (Green Line) towards ${destination.name}`,
                 distance: "4 stops", coordinates: allSteps[Math.floor((startIdx+endIdx)/2)].coordinates
               });
               transitSteps.push({
                 id: 0, direction: "straight",
                 instruction: `Alight at ${endRoad} MRT Station`,
                 distance: "", coordinates: allSteps[endIdx].coordinates
               });
            } else {
               // Deterministic bus number based on coords
               const busNum = ["12", "36", "147", "190", "960"][Math.floor((start[0]*1000)%5)];
               transitSteps.push({
                 id: 0, direction: "straight", 
                 instruction: `Walk to bus stop at ${startRoad}`, 
                 distance: "3 mins", coordinates: allSteps[startIdx].coordinates
               });
               transitSteps.push({
                 id: 0, direction: "bus", 
                 instruction: `Take Bus ${busNum} towards ${destination.name}`, 
                 distance: "5 stops", coordinates: allSteps[Math.floor((startIdx+endIdx)/2)].coordinates
               });
               transitSteps.push({
                 id: 0, direction: "straight", 
                 instruction: `Press bell and alight at ${endRoad} bus stop`, 
                 distance: "", coordinates: allSteps[endIdx].coordinates
               });
            }
            
            newSteps = [...startSegment, ...transitSteps, ...endSegment].map((s,i)=>({...s, id: i+1}));
          } else {
            newSteps = allSteps;
          }
        }
      } catch (error) {
        console.error("OSRM Error:", error);
      }
    }

    // Fallback to mock if everything fails
    if (newSteps.length === 0) {
      // Create simulated waypoints (zigzag) to demonstrate AR updates
      const wp1: [number, number] = [
          start[0] + (end[0] - start[0]) * 0.33 + 0.001, // Slight detour
          start[1] + (end[1] - start[1]) * 0.33
      ];
      const wp2: [number, number] = [
          start[0] + (end[0] - start[0]) * 0.66 - 0.001, // Slight detour back
          start[1] + (end[1] - start[1]) * 0.66
      ];

      newSteps = [
        { id: 1, direction: "straight", instruction: "Walk straight towards the junction", distance: "150 meters", coordinates: wp1 },
        { id: 2, direction: "right", instruction: "Turn right and follow the path", distance: "100 meters", coordinates: wp2 },
        { id: 3, direction: "bus", instruction: "Take Bus 36", distance: "2 stops", coordinates: end },
        { id: 4, direction: "destination", instruction: "You have arrived!", distance: "", coordinates: end },
      ];
      newPath = [start, wp1, wp2, end];
    }

    setNavigationSteps(newSteps);
    setRoutePath(newPath);
    
    onNavigationStart?.(destination);
  };

  const handleBackToHome = () => {
    setAppView("home");
    setSelectedDestination(null);
    setCurrentStepIndex(0);
    setShowAR(false);
    stop();
    stopTracking(); // 🟢 MERGED: Stop location simulation
    setRoutePath([]); // Clear path
    // 🟢 MERGED: Ensure navigation status is reset on the caregiver side too
    if (updateNavigationStatus && patient) {
      updateNavigationStatus(patient.id, false, false, 0, currentLocation);
    }
  };

  // Auto-speak first step when navigation starts
  useEffect(() => {
    if (appView === "navigation" && voiceEnabled && selectedDestination && navigationSteps.length > 0) {
      const timer = setTimeout(() => {
        speak(`Starting navigation to ${selectedDestination.name}. ${navigationSteps[0].instruction}. ${navigationSteps[0].distance || ""}`);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [appView, selectedDestination, voiceEnabled, navigationSteps]);

  const handleSpeakStep = (stepIndex: number) => {
    if (isSpeaking) {
      stop();
    } else {
      const step = navigationSteps[stepIndex];
      speakStep(stepIndex + 1, `${step.instruction}. ${step.distance || ""}`);
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < navigationSteps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      if (voiceEnabled) {
        const step = navigationSteps[nextIndex];
        setTimeout(() => {
          speakStep(nextIndex + 1, `${step.instruction}. ${step.distance || ""}`);
        }, 300);
      }
    }
  };

  const toggleVoice = () => {
    if (voiceEnabled) {
      stop();
    }
    setVoiceEnabled(!voiceEnabled);
  };

  // Profile view
  if (appView === "profile") {
    if (!patient) return null; // 🟢 Safety check
    return (
      <PatientProfilePage 
        patient={patient} 
        onBack={handleBackToHome} 
      />
    );
  }

  // 🟢 Safety check: If patient data is missing (e.g. during logout), don't render
  if (!patient) return null;

  if (appView === "navigation" && selectedDestination) {
    return (
      <div className="min-h-screen pb-32 pt-4">
        {/* AR Overlay */}
        {showAR && (
          <>
            <ARNavigation 
              currentLocation={currentLocation}
              routePath={routePath}
              onClose={() => setShowAR(false)}
            />
            {/* 泙 NEW: Button to return to standard direction guide */}
            <div className="fixed bottom-8 left-0 right-0 z-[60] flex justify-center px-4">
               <Button 
                 onClick={() => setShowAR(false)}
                 className="w-full max-w-md h-16 text-xl font-bold rounded-2xl bg-white text-black hover:bg-gray-100 shadow-2xl border-2 border-black/10"
               >
                 <ArrowLeft className="h-6 w-6 mr-2" />
                 Back to Direction Guide
               </Button>
            </div>
          </>
        )}

        <div className="px-4 space-y-4 pb-48">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={handleBackToHome} className="text-muted-foreground">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            
            {/* 🟢 NEW: Allow switching role during navigation to test alerts */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleSwitchRole}
                className="border-2 border-red-100 hover:bg-red-50"
                title="Switch Role (Test Alert)"
              >
                <LogOut className="h-5 w-5 text-red-500" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={toggleVoice}
                className={voiceEnabled ? "bg-primary text-primary-foreground" : ""}
              >
                {voiceEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Destination Header */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent text-2xl">
              {selectedDestination.icon}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Going to</p>
              <h2 className="text-2xl font-bold text-foreground">{selectedDestination.name}</h2>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 py-2">
            {navigationSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index <= currentStepIndex ? "bg-primary w-8" : "bg-muted w-4"
                }`}
              />
            ))}
          </div>

          {/* 📱 MOBILE-FRIENDLY: Show only current and next step */}
          <div className="space-y-4">
            {/* Current Step - Always visible */}
            <NavigationStepCard
              key={navigationSteps[currentStepIndex]?.id}
              stepNumber={currentStepIndex + 1}
              direction={navigationSteps[currentStepIndex]?.direction}
              instruction={navigationSteps[currentStepIndex]?.instruction}
              distance={navigationSteps[currentStepIndex]?.distance}
              isActive={true}
              isCompleted={false}
              onSpeak={() => handleSpeakStep(currentStepIndex)}
              isSpeaking={isSpeaking}
            />

            {/* Next Step Preview - If not last step */}
            {currentStepIndex < navigationSteps.length - 1 && (
              <div className="opacity-60">
                <p className="text-sm font-semibold text-muted-foreground mb-2">Next Step:</p>
                <NavigationStepCard
                  key={navigationSteps[currentStepIndex + 1]?.id}
                  stepNumber={currentStepIndex + 2}
                  direction={navigationSteps[currentStepIndex + 1]?.direction}
                  instruction={navigationSteps[currentStepIndex + 1]?.instruction}
                  distance={navigationSteps[currentStepIndex + 1]?.distance}
                  isActive={false}
                  isCompleted={false}
                />
              </div>
            )}
          </div>

          {/* AR Camera Button */}
          <Button
            onClick={() => setShowAR(true)}
            className="w-full h-16 text-xl font-bold rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
          >
            <Camera className="h-7 w-7 mr-3" />
            View Live AR Guide
          </Button>

          {/* Bus Info - show when relevant */}
          {navigationSteps[currentStepIndex]?.direction === "bus" && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-foreground">Your Bus</h3>
              <BusArrivalCard
                busNumber="36"
                destination={selectedDestination.name}
                arrivalTime="3 min"
                crowdLevel="low"
                nextArrival="12 min"
              />
            </div>
          )}

          {/* 🚇 MRT Info - show when relevant */}
          {navigationSteps[currentStepIndex]?.direction === "mrt" && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-foreground">Your Train</h3>
              <MRTArrivalCard
                line="Green Line"
                platform="Platform 1"
                destination={selectedDestination.name}
                arrivalTime="2 min"
                nextArrival="5 min"
                crowdLevel="medium"
              />
            </div>
          )}

          {/* Call Guardian */}
          <CallGuardianButton guardianPhone={patient.guardianPhone} />
        </div>

        {/* Fixed Action Buttons at Bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent pt-4 pb-6 px-4 space-y-3">
          {/* Done! Next Step / I Have Arrived Button */}
          {currentStepIndex < navigationSteps.length - 1 ? (
            <Button
              onClick={handleNextStep}
              className="w-full h-16 text-xl font-bold rounded-2xl bg-primary hover:bg-primary/90 shadow-lg"
            >
              <CheckCircle className="h-7 w-7 mr-3" />
              Done! Next Step
            </Button>
          ) : (
            <Button
              onClick={handleBackToHome}
              className="w-full h-16 text-xl font-bold rounded-2xl bg-green-600 hover:bg-green-700 shadow-lg"
            >
              <CheckCircle className="h-7 w-7 mr-3" />
              I Have Arrived!
            </Button>
          )}

          {/* Emergency Button */}
          <div className="flex justify-center">
            <EmergencyButton onEmergency={handleEmergency} />
          </div>
        </div>
      </div>
    );
  }

  // Home view with saved destinations
  return (
    <div className="min-h-screen pb-32 pt-4">
      <div className="px-4 space-y-6">
        {/* Greeting with Profile Access */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-foreground">
              Hello, {patient.name}! 
            </h1>
            <p className="text-lg text-muted-foreground">
              Where would you like to go today?
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setAppView("profile")}
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full border-2"
            >
              <User className="h-6 w-6" />
            </Button>
            <Button
              onClick={handleSwitchRole}
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full border-2"
              title="Switch Role"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Saved Destinations - Read only, managed by caregiver */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Your Places</h2>
          {destinations.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-muted/50 border border-border">
              <p className="text-muted-foreground">
                No places saved yet. Ask your caregiver to add destinations for you.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {destinations.map((destination) => (
                <DestinationCard
                  key={destination.id}
                  destination={destination}
                  onSelect={handleDestinationSelect}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pairing Code */}
        <PairingCodeCard pairingCode={patient.pairingCode} patientName={patient.name} />

        {/* Call Guardian */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">Need Help?</h2>
          <CallGuardianButton guardianPhone={patient.guardianPhone} />
        </div>
      </div>

      {/* Emergency Button - Fixed */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
        <EmergencyButton onEmergency={handleEmergency} />
      </div>
    </div>
  );
};

export default PatientInterface;