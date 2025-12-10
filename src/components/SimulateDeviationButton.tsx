
// src/components/SimulateDeviationButton.tsx

'use client';

import { Bug, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSimulatedLocationTracking } from "@/hooks/useLocationTracking";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";

interface SimulateDeviationButtonProps {
  patientId: string;
  initialLocation?: [number, number]; 
  destinationLocation?: [number, number];
}

const SimulateDeviationButton = ({ 
    patientId, 
    initialLocation = [1.3521, 103.8198],
    destinationLocation = [1.3621, 103.8298] 
}: SimulateDeviationButtonProps) => {
  const { updateNavigationStatus } = useAuth();
  const [isSimulating, setIsSimulating] = useState(false);

  // Use the simulated hook to generate location updates
  const { 
    currentLocation, 
    isDeviated, 
    deviationDistance, 
    startTracking, 
    stopTracking, 
    triggerDeviation,
  } = useSimulatedLocationTracking(initialLocation, destinationLocation, {
    // Ensure that deviation is instantly reported to AuthContext
    onDeviation: (distance, location) => {
        updateNavigationStatus(patientId, true, true, distance, location);
    },
    onLocationUpdate: (location) => {
        // Report non-deviated state during normal tracking
        if (isSimulating && !isDeviated) {
             updateNavigationStatus(patientId, true, false, 0, location);
        }
    }
  });

  const handleSimulate = () => {
    if (!isSimulating) {
      // 1. Start tracking movement
      startTracking();
      setIsSimulating(true);
      toast({
        title: "Simulation Started",
        description: "Movement towards destination is being simulated.",
      });
      
      // 2. Trigger the deviation after a short delay
      setTimeout(() => {
        triggerDeviation();
        toast({
          title: "Deviation Triggered!",
          description: "Location set off-route. Traveller has deviated from path!",
          variant: "destructive"
        });
      }, 5000);
    } else {
      stopTracking();
      setIsSimulating(false);
      // Reset status when simulation stops
      updateNavigationStatus(patientId, false, false, 0, currentLocation || initialLocation);
      toast({
        title: "Simulation Stopped",
        description: "Location tracking simulation has ended.",
      });
    }
  };

  const buttonText = isDeviated ? "STOP DEVIATION ALERT" : isSimulating ? "STOP SIMULATION" : "START DEVIATION DEMO";

  return (
    <Button
      onClick={handleSimulate}
      variant={isDeviated ? "emergency" : isSimulating ? "secondary" : "default"}
      className="gap-2 w-full"
    >
      {isDeviated ? <AlertTriangle className="h-5 w-5 animate-pulse" /> : <Bug className="h-5 w-5" />}
      {buttonText}
    </Button>
  );
};

export default SimulateDeviationButton;