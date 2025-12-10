import { useState, useEffect } from "react";
import { ArrowLeft, User, Volume2, VolumeX, CheckCircle, LogOut } from "lucide-react";
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
}

const PatientInterface = ({ patient, onNavigationStart }: PatientInterfaceProps) => {
  const { logout } = useAuth();
  const [appView, setAppView] = useState<AppView>("home");
  const [selectedDestination, setSelectedDestination] = useState<SavedDestination | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const { speak, speakStep, stop, isSpeaking } = useVoiceNavigation({ rate: 0.85 });

  const handleSwitchRole = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You can now select a different role",
    });
  };

  // Mock navigation steps - in real app would come from routing API
  const navigationSteps: NavigationStep[] = [
    { id: 1, direction: "straight", instruction: "Walk straight ahead", distance: "50 meters" },
    { id: 2, direction: "right", instruction: "Turn right at the traffic light", distance: "100 meters" },
    { id: 3, direction: "bus", instruction: "Take Bus 36 at the bus stop", distance: "3 stops" },
    { id: 4, direction: "left", instruction: "Exit bus and turn left", distance: "20 meters" },
    { id: 5, direction: "destination", instruction: "You have arrived!", distance: "" },
  ];

  // Use patient's destinations from auth context (managed by caregiver)
  const destinations = patient.destinations || [];

  const handleDestinationSelect = (destination: SavedDestination) => {
    setSelectedDestination(destination);
    setAppView("navigation");
    setCurrentStepIndex(0);
    onNavigationStart?.(destination);
  };

  const handleBackToHome = () => {
    setAppView("home");
    setSelectedDestination(null);
    setCurrentStepIndex(0);
    stop();
  };

  // Auto-speak first step when navigation starts
  useEffect(() => {
    if (appView === "navigation" && voiceEnabled && selectedDestination) {
      const timer = setTimeout(() => {
        speak(`Starting navigation to ${selectedDestination.name}. ${navigationSteps[0].instruction}. ${navigationSteps[0].distance || ""}`);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [appView, selectedDestination, voiceEnabled]);

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
