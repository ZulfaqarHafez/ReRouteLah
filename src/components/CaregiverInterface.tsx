import { useState, useEffect, useCallback } from "react";
import { Bell, MapPin, Settings, Phone, AlertTriangle, UserPlus, Users, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CaregiverInfo, PatientInfo, SavedDestination } from "@/types/app";
import { toast } from "@/hooks/use-toast";
import PatientStatusCard from "./PatientStatusCard";
import MapDisplay from "./MapDisplay";
import DeviationAlert from "./DeviationAlert";
import LiveLocationBanner from "./LiveLocationBanner";
import DestinationManager from "./DestinationManager";
import LinkPatientDialog from "./LinkPatientDialog";
import { useSimulatedLocationTracking } from "@/hooks/useLocationTracking";
import { useAuth } from "@/contexts/AuthContext";

interface CaregiverInterfaceProps {
  caregiver: CaregiverInfo;
  activePatient: PatientInfo | null;
  patientDestination: SavedDestination | null;
}

type CaregiverView = "dashboard" | "map" | "destinations";

const CaregiverInterface = ({ 
  caregiver, 
  activePatient, 
  patientDestination 
}: CaregiverInterfaceProps) => {
  const { logout } = useAuth();
  const [view, setView] = useState<CaregiverView>("dashboard");
  const [showDeviationAlert, setShowDeviationAlert] = useState(false);
  const [selectedPatientForDestinations, setSelectedPatientForDestinations] = useState<PatientInfo | null>(null);

  // Handle deviation callback
  const handleDeviation = useCallback((distance: number, location: [number, number]) => {
    if (activePatient) {
      setShowDeviationAlert(true);
      toast({
        title: "⚠️ Route Deviation Detected",
        description: `${activePatient.name} has gone ${Math.round(distance)}m off the planned route`,
        variant: "destructive",
      });
    }
  }, [activePatient?.name]);

  // Simulated location tracking
  const {
    currentLocation,
    isTracking,
    isDeviated,
    deviationDistance,
    lastUpdated,
    startTracking,
    stopTracking,
    triggerDeviation,
  } = useSimulatedLocationTracking(
    activePatient?.currentLocation || [1.3521, 103.8198],
    patientDestination?.coordinates || null,
    {
      deviationThreshold: 50,
      onDeviation: handleDeviation,
    }
  );

  // Start tracking when patient starts navigation
  useEffect(() => {
    if (patientDestination && activePatient) {
      startTracking();
      toast({
        title: `${activePatient.name} started navigation`,
        description: `Heading to ${patientDestination.name}`,
      });
    } else {
      stopTracking();
    }
  }, [patientDestination, activePatient?.name, startTracking, stopTracking]);

  const handleViewOnMap = () => {
    setShowDeviationAlert(false);
    setView("map");
  };

  const handleCallPatient = () => {
    if (activePatient) {
      window.location.href = `tel:${activePatient.profile.phone}`;
    }
  };

  const handleManageDestinations = (patient: PatientInfo) => {
    setSelectedPatientForDestinations(patient);
    setView("destinations");
  };

  const handleSwitchRole = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You can now select a different role",
    });
  };

  // No patients linked yet
  if (!activePatient && caregiver.patients.length === 0) {
    return (
      <div className="min-h-screen pb-8 pt-4">
        <div className="px-4 space-y-6">
          {/* Greeting */}
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-foreground">
              Welcome, {caregiver.name}! 💜
            </h1>
            <p className="text-lg text-muted-foreground">
              Let's connect you to your travelers
            </p>
          </div>

          {/* Empty state */}
          <div className="p-8 text-center rounded-2xl bg-card border-2 border-dashed border-border">
            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-bold text-foreground mb-2">
              No travelers linked yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Get a pairing code from your traveler's app to connect with them
            </p>
            <LinkPatientDialog
              trigger={
                <Button size="lg" className="gap-2">
                  <UserPlus className="h-5 w-5" />
                  Link a Traveler
                </Button>
              }
            />
          </div>

          {/* How it works */}
          <div className="p-6 rounded-2xl bg-muted/50">
            <h3 className="font-bold text-foreground mb-4">How to connect:</h3>
            <ol className="space-y-3 text-muted-foreground">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</span>
                <span>Your traveler opens ReRouteLah and sets up their account</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</span>
                <span>They'll see a 6-character pairing code</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</span>
                <span>Enter that code here to connect</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (view) {
      case "map":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => setView("dashboard")}>
                ← Back to Dashboard
              </Button>
              {/* Demo button to trigger deviation */}
              {isTracking && !isDeviated && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-destructive border-destructive/50"
                  onClick={triggerDeviation}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Simulate Deviation
                </Button>
              )}
            </div>

            {/* Live Status Banner */}
            {activePatient && (
              <LiveLocationBanner
                patientName={activePatient.name}
                isNavigating={!!patientDestination}
                isDeviated={isDeviated}
                lastUpdated={lastUpdated}
              />
            )}
            
            <div className="h-[50vh] rounded-2xl overflow-hidden shadow-lg">
              <MapDisplay 
                center={currentLocation} 
                className="h-full" 
              />
            </div>

            {activePatient && (
              <div className="p-4 rounded-2xl bg-card border border-border">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg">
                    {activePatient.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-foreground">{activePatient.name}'s Location</p>
                    <p className="text-sm text-muted-foreground">
                      {currentLocation[0].toFixed(4)}, {currentLocation[1].toFixed(4)}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={handleCallPatient}>
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                </div>
                {patientDestination && (
                  <div className="mt-3 p-3 rounded-xl bg-accent/50">
                    <p className="text-sm text-muted-foreground">Currently navigating to</p>
                    <p className="font-bold text-foreground flex items-center gap-2">
                      <span>{patientDestination.icon}</span>
                      {patientDestination.name}
                    </p>
                  </div>
                )}
                {isDeviated && (
                  <div className="mt-3 p-3 rounded-xl bg-destructive/10 border border-destructive/30">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">Off route by {Math.round(deviationDistance)}m</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case "destinations":
        return (
          <div className="space-y-4">
            <Button variant="ghost" onClick={() => setView("dashboard")}>
              ← Back to Dashboard
            </Button>

            {selectedPatientForDestinations ? (
              <DestinationManager patient={selectedPatientForDestinations} />
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-foreground">
                  Select a Traveler
                </h2>
                {caregiver.patients.map((patient) => (
                  <Button
                    key={patient.id}
                    variant="outline"
                    className="w-full justify-start h-auto p-4"
                    onClick={() => setSelectedPatientForDestinations(patient)}
                  >
                    <span className="text-2xl mr-3">{patient.avatar}</span>
                    <span className="font-medium">{patient.name}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            {/* Greeting */}
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold text-foreground">
                  Hello, {caregiver.name}! 💜
                </h1>
                <p className="text-lg text-muted-foreground">
                  Monitor and support your loved ones
                </p>
              </div>
              <div className="flex gap-2">
                <LinkPatientDialog />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleSwitchRole}
                  className="h-10 w-10"
                  title="Switch Role"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Live Tracking Status */}
            {activePatient && (
              <LiveLocationBanner
                patientName={activePatient.name}
                isNavigating={!!patientDestination}
                isDeviated={isDeviated}
                lastUpdated={lastUpdated}
              />
            )}

            {/* Deviation Alert Banner */}
            {isDeviated && activePatient && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/30 animate-pulse">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <div className="flex-1">
                  <p className="font-medium text-destructive">
                    {activePatient.name} went off route!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {Math.round(deviationDistance)}m from planned path
                  </p>
                </div>
                <Button size="sm" variant="destructive" onClick={handleViewOnMap}>
                  View
                </Button>
              </div>
            )}

            {/* Notification Banner */}
            {patientDestination && !isDeviated && activePatient && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/10 border border-primary/20">
                <Bell className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    {activePatient.name} is navigating
                  </p>
                  <p className="text-sm text-muted-foreground">
                    To {patientDestination.name}
                  </p>
                </div>
                <Button size="sm" onClick={handleViewOnMap}>
                  View
                </Button>
              </div>
            )}

            {/* Patient Status */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">Your Travelers</h2>
                <span className="text-sm text-muted-foreground">
                  {caregiver.patients.length} linked
                </span>
              </div>
              {caregiver.patients.map((patient) => (
                <PatientStatusCard
                  key={patient.id}
                  patient={patient}
                  destination={patient.id === activePatient?.id ? patientDestination : null}
                  onViewOnMap={handleViewOnMap}
                  isDeviated={patient.id === activePatient?.id ? isDeviated : false}
                />
              ))}
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">Quick Actions</h2>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2 rounded-2xl"
                  onClick={handleViewOnMap}
                  disabled={!activePatient}
                >
                  <MapPin className="h-6 w-6" />
                  <span className="text-xs">View Location</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2 rounded-2xl"
                  onClick={() => {
                    setSelectedPatientForDestinations(null);
                    setView("destinations");
                  }}
                >
                  <Settings className="h-6 w-6" />
                  <span className="text-xs">Manage Places</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2 rounded-2xl"
                  onClick={handleCallPatient}
                  disabled={!activePatient}
                >
                  <Phone className="h-6 w-6" />
                  <span className="text-xs">Call Traveler</span>
                </Button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen pb-8 pt-4">
      <div className="px-4">
        {renderContent()}
      </div>

      {/* Deviation Alert Modal */}
      {showDeviationAlert && activePatient && (
        <DeviationAlert
          patient={activePatient}
          deviationDistance={deviationDistance}
          onDismiss={() => setShowDeviationAlert(false)}
          onViewOnMap={handleViewOnMap}
          onCallPatient={handleCallPatient}
        />
      )}
    </div>
  );
};

export default CaregiverInterface;
