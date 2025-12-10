'use client';

import { useState, useEffect } from "react";
import { ArrowLeft, User, Volume2, VolumeX, CheckCircle, LogOut, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SavedDestination, PatientInfo } from "@/types/app";
import DestinationCard from "./DestinationCard";
import CallGuardianButton from "./CallGuardianButton";
import EmergencyButton from "./EmergencyButton";
import BusArrivalCard from "./BusArrivalCard";
import PatientProfilePage from "./PatientProfilePage";
import NavigationStepCard from "./NavigationStepCard";
import { useVoiceNavigation } from "@/hooks/useVoiceNavigation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import ARNavigation from "./ARNavigation";

interface PatientInterfaceProps {
  patient: PatientInfo;
  onNavigationStart?: (destination: SavedDestination) => void;
}

type AppView = "home" | "navigation" | "profile";

interface NavigationStep {
  id: number;
  direction: "straight" | "left" | "right" | "bus" | "destination";
  instruction: string;
  distance?: string;
  coordinates?: [number, number]; // 🟢 Added coordinates for AR
}

const PatientInterface = ({ patient, onNavigationStart }: PatientInterfaceProps) => {
  const { logout } = useAuth();
  const [appView, setAppView] = useState<AppView>("home");
  const [selectedDestination, setSelectedDestination] = useState<SavedDestination | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const { speak, speakStep, stop, isSpeaking } = useVoiceNavigation({ rate: 0.85 });
  
  // AR State
  const [showAR, setShowAR] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<[number, number]>(
    patient.currentLocation || [1.3521, 103.8198]
  );

  // 🟢 NEW: State for dynamic route generation
  const [navigationSteps, setNavigationSteps] = useState<NavigationStep[]>([]);
  const [routePath, setRoutePath] = useState<[number, number][]>([]);

  // Track location for AR
  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => console.error("GPS Error:", error),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  const handleSwitchRole = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You can now select a different role",
    });
  };

  // 🟢 CHANGED: Navigation steps are now generated dynamically in handleDestinationSelect
  // to ensure they align with the AR route path.

  // Use patient's destinations from auth context (managed by caregiver)
  const destinations = patient.destinations || [];

  const handleDestinationSelect = (destination: SavedDestination) => {
    setSelectedDestination(destination);
    setAppView("navigation");
    setCurrentStepIndex(0);
    
    // 🟢 NEW: Generate mock route path and steps based on actual destination
    // This creates intermediate waypoints so the AR arrow updates as you move
    const start = currentLocation;
    const end = destination.coordinates;
    
    // Create simulated waypoints (zigzag) to demonstrate AR updates
    const wp1: [number, number] = [
        start[0] + (end[0] - start[0]) * 0.33 + 0.001, // Slight detour
        start[1] + (end[1] - start[1]) * 0.33
    ];
    const wp2: [number, number] = [
        start[0] + (end[0] - start[0]) * 0.66 - 0.001, // Slight detour back
        start[1] + (end[1] - start[1]) * 0.66
    ];

    const newSteps: NavigationStep[] = [
      { id: 1, direction: "straight", instruction: "Walk straight towards the junction", distance: "150 meters", coordinates: wp1 },
      { id: 2, direction: "right", instruction: "Turn right and follow the path", distance: "100 meters", coordinates: wp2 },
      { id: 3, direction: "bus", instruction: "Take Bus 36", distance: "2 stops", coordinates: end },
      { id: 4, direction: "destination", instruction: "You have arrived!", distance: "", coordinates: end },
    ];

    setNavigationSteps(newSteps);
    setRoutePath([start, wp1, wp2, end]); // AR will follow this path sequence
    
    onNavigationStart?.(destination);
  };

  const handleBackToHome = () => {
    setAppView("home");
    setSelectedDestination(null);
    setCurrentStepIndex(0);
    setShowAR(false);
    stop();
    setRoutePath([]); // Clear path
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
    return (
      <PatientProfilePage 
        patient={patient} 
        onBack={handleBackToHome} 
      />
    );
  }

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
            {/* 🟢 NEW: Button to return to standard direction guide */}
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

        <div className="px-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={handleBackToHome} className="text-muted-foreground">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
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

          {/* AR Camera Button */}
          <Button 
            onClick={() => setShowAR(true)}
            className="w-full h-16 text-xl font-bold rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
          >
            <Camera className="h-7 w-7 mr-3" />
            View Live AR Guide
          </Button>

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

          {/* Navigation Step Cards */}
          <div className="space-y-4">
            {navigationSteps.map((step, index) => (
              <NavigationStepCard
                key={step.id}
                stepNumber={index + 1}
                direction={step.direction}
                instruction={step.instruction}
                distance={step.distance}
                isActive={index === currentStepIndex}
                isCompleted={index < currentStepIndex}
                onSpeak={() => handleSpeakStep(index)}
                isSpeaking={isSpeaking && index === currentStepIndex}
              />
            ))}
          </div>

          {/* Next Step / Complete Button */}
          {currentStepIndex < navigationSteps.length - 1 ? (
            <Button
              onClick={handleNextStep}
              className="w-full h-16 text-xl font-bold rounded-2xl bg-primary text-primary-foreground"
            >
              <CheckCircle className="h-7 w-7 mr-3" />
              Done! Next Step
            </Button>
          ) : (
            <Button
              onClick={handleBackToHome}
              className="w-full h-16 text-xl font-bold rounded-2xl bg-accent text-accent-foreground"
            >
              <CheckCircle className="h-7 w-7 mr-3" />
              I Have Arrived!
            </Button>
          )}

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

          {/* Call Guardian */}
          <CallGuardianButton guardianPhone={patient.guardianPhone} />
        </div>

        {/* Emergency Button - Fixed */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
          <EmergencyButton />
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
              Hello, {patient.name}! 👋
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

        {/* Call Guardian */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">Need Help?</h2>
          <CallGuardianButton guardianPhone={patient.guardianPhone} />
        </div>
      </div>

      {/* Emergency Button - Fixed */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
        <EmergencyButton />
      </div>
    </div>
  );
};

export default PatientInterface;
