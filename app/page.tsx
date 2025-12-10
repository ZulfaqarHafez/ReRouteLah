// app/page.tsx (New Content from Index.tsx)
'use client'; 
// We need 'use client' because this page uses hooks (useState, useAuth) 
// and imports client components (like Button and all component interfaces)

import { useState } from "react";
import { MapPin, LogOut } from "lucide-react";
// Import paths updated to reflect the planned src/types/app.ts location
import { UserRole, SavedDestination } from "@/types/index"; 
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import RoleSelectionPage from "@/components/RoleSelectionPage";
import PatientSetupPage from "@/components/PatientSetupPage";
import CaregiverSetupPage from "@/components/CaregiverSetupPage";
import PatientInterface from "@/components/PatientInterface";
import CaregiverInterface from "@/components/CaregiverInterface";

type SetupStep = "select-role" | "patient-setup" | "caregiver-setup" | "app";

const Index = () => {
  // Assuming useAuth, patientData, and caregiverData are correctly typed in AuthContext
  const { session, patientData, caregiverData, login, logout } = useAuth();
  const [setupStep, setSetupStep] = useState<SetupStep>(session ? "app" : "select-role");
  const [patientDestination, setPatientDestination] = useState<SavedDestination | null>(null);

  const handleRoleSelect = (role: UserRole) => {
    if (role === "patient") {
      setSetupStep("patient-setup");
    } else {
      setSetupStep("caregiver-setup");
    }
  };

  const handlePatientSetupComplete = (name: string, phone: string) => {
    login("patient", name, phone);
    setSetupStep("app");
  };

  const handleCaregiverSetupComplete = (name: string, phone: string) => {
    login("caregiver", name, phone);
    setSetupStep("app");
  };

  const handleLogout = () => {
    logout();
    setSetupStep("select-role");
  };

  const handleNavigationStart = (destination: SavedDestination) => {
    setPatientDestination(destination);
  };

  // Show setup screens if not logged in
  if (!session || setupStep !== "app") {
    if (setupStep === "select-role") {
      return <RoleSelectionPage onSelectRole={handleRoleSelect} />;
    }
    if (setupStep === "patient-setup") {
      return (
        <PatientSetupPage
          onBack={() => setSetupStep("select-role")}
          onComplete={handlePatientSetupComplete}
        />
      );
    }
    if (setupStep === "caregiver-setup") {
      return (
        <CaregiverSetupPage
          onBack={() => setSetupStep("select-role")}
          onComplete={handleCaregiverSetupComplete}
        />
      );
    }
  }

  // Main app interface
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <MapPin className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <span className="text-lg font-bold text-foreground">ReRouteLah</span>
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {session?.role === "patient" ? "Traveler" : "Caregiver"}
              </span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16">
        {session?.role === "patient" && patientData ? (
          <PatientInterface 
            patient={patientData} 
            onNavigationStart={handleNavigationStart}
          />
        ) : session?.role === "caregiver" && caregiverData ? (
          <CaregiverInterface 
            caregiver={caregiverData}
            activePatient={caregiverData.patients[0] || null}
            patientDestination={patientDestination}
          />
        ) : (
          <div className="flex items-center justify-center h-[80vh]">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;