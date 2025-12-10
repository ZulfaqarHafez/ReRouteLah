'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthSession, UserRole, PatientInfo, CaregiverInfo, SavedDestination } from '@/types';
import { mockSavedDestinations } from '@/data/mockData';
import { toast } from "@/hooks/use-toast"; // 🟢 Added import

interface AuthContextType {
  session: AuthSession | null;
  patientData: PatientInfo | null;
  caregiverData: CaregiverInfo | null;
  allPatients: PatientInfo[];
  login: (role: UserRole, name: string, phone?: string, pairingCode?: string) => void;
  logout: () => void;
  updatePatientDestinations: (patientId: string, destinations: SavedDestination[]) => void;
  updateNavigationStatus: (
    patientId: string,
    isNavigating: boolean,
    isDeviated: boolean,
    deviationDistance: number,
    currentLocation: [number, number]
  ) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'reroutelah_auth';
const PATIENTS_KEY = 'reroutelah_patients';
const CAREGIVERS_KEY = 'reroutelah_caregivers';

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [patientData, setPatientData] = useState<PatientInfo | null>(null);
  const [caregiverData, setCaregiverData] = useState<CaregiverInfo | null>(null);
  const [allPatients, setAllPatients] = useState<PatientInfo[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem(STORAGE_KEY);
    const savedPatients = localStorage.getItem(PATIENTS_KEY);
    const savedCaregivers = localStorage.getItem(CAREGIVERS_KEY);

    if (savedPatients) {
      setAllPatients(JSON.parse(savedPatients));
    }

    if (savedSession) {
      const parsedSession: AuthSession = JSON.parse(savedSession);
      setSession(parsedSession);

      if (parsedSession.role === 'patient' && savedPatients) {
        const patients: PatientInfo[] = JSON.parse(savedPatients);
        const patient = patients.find(p => p.id === parsedSession.userId);
        if (patient) setPatientData(patient);
      }

      if (parsedSession.role === 'caregiver' && savedCaregivers) {
        const caregivers: CaregiverInfo[] = JSON.parse(savedCaregivers);
        const caregiver = caregivers.find(c => c.id === parsedSession.userId);
        if (caregiver) {
          // Populate linked patients
          const patients: PatientInfo[] = savedPatients ? JSON.parse(savedPatients) : [];
          const linkedPatients = patients.filter(p => 
            parsedSession.linkedPatients?.includes(p.id)
          );
          setCaregiverData({ ...caregiver, patients: linkedPatients });
        }
      }
    }
  }, []);

  // Persist patients when they change
  useEffect(() => {
    if (allPatients.length > 0) {
      localStorage.setItem(PATIENTS_KEY, JSON.stringify(allPatients));
    }
  }, [allPatients]);

  const login = (role: UserRole, name: string, phone: string = "") => {
    const userId = generateId();
    
    if (role === 'patient') {
      const newPatient: PatientInfo = {
        id: userId,
        name,
        avatar: '👤',
        pairingCode: generateCode(),
        currentLocation: [1.3521, 103.8198],
        isNavigating: false,
        destination: null,
        guardianPhone: phone || '',
        destinations: [...mockSavedDestinations],
        profile: {
          id: userId,
          name,
          avatar: '👤',
          membershipNo: `G${Date.now().toString().slice(-8)}Q`,
          phone: phone || '',
          nricNo: 'S****' + Math.random().toString().slice(2, 6) + 'A',
          homeAddress: '',
          postalCode: '',
        },
      };

      const updatedPatients = [...allPatients, newPatient];
      setAllPatients(updatedPatients);
      setPatientData(newPatient);
      localStorage.setItem(PATIENTS_KEY, JSON.stringify(updatedPatients));

      const newSession: AuthSession = { role, userId };
      setSession(newSession);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));

      } else { // Role is 'caregiver'
      
      // 🟢 CHANGED: Find ANY deviated patient to ensure alert works regardless of which patient was used
      const deviatedPatient = allPatients.find(p => p.isDeviated);
      
      // 💡 CRITICAL: Auto-link to the deviated patient if one exists, otherwise the first one
      const targetPatient = deviatedPatient || allPatients[0];
      const linkedPatientIds = targetPatient ? [targetPatient.id] : [];
      
      const newCaregiver: CaregiverInfo = {
        id: userId,
        name,
        phone: phone || '',
        patients: targetPatient ? [targetPatient] : [], // Populate patient list immediately
      };

      // 🟢 NEW: Check for deviation immediately upon login and notify
      if (deviatedPatient) {
        setTimeout(() => {
          toast({
            title: "⚠️ Alert: Patient Deviation Detected",
            description: `${deviatedPatient.name} is currently off-route by ${Math.round(deviatedPatient.deviationDistance || 0)}m.`,
            variant: "destructive",
            duration: 5000,
          });
        }, 800); // Slight delay to ensure UI is mounted
      }

      const savedCaregivers = localStorage.getItem(CAREGIVERS_KEY);
      const caregivers: CaregiverInfo[] = savedCaregivers ? JSON.parse(savedCaregivers) : [];
      caregivers.push(newCaregiver);
      localStorage.setItem(CAREGIVERS_KEY, JSON.stringify(caregivers));

      setCaregiverData(newCaregiver);

      // Ensure session contains linked patients
      const newSession: AuthSession = { role, userId, linkedPatients: linkedPatientIds };
      setSession(newSession);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
    }
  };

  const logout = () => {
    setSession(null);
    setPatientData(null);
    setCaregiverData(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const updatePatientDestinations = (patientId: string, destinations: SavedDestination[]) => {
    const updatedPatients = allPatients.map(p => 
      p.id === patientId ? { ...p, destinations } : p
    );
    setAllPatients(updatedPatients);
    localStorage.setItem(PATIENTS_KEY, JSON.stringify(updatedPatients));

    // Update caregiver's view
    if (caregiverData) {
      const updatedCaregiverPatients = caregiverData.patients.map(p =>
        p.id === patientId ? { ...p, destinations } : p
      );
      setCaregiverData({ ...caregiverData, patients: updatedCaregiverPatients });
    }

    // Update patient data if current user is that patient
    if (patientData?.id === patientId) {
      setPatientData({ ...patientData, destinations });
    }
  };

  // src/contexts/AuthContext.tsx - inside AuthProvider

  const updateNavigationStatus = React.useCallback((
    patientId: string,
    isNavigating: boolean,
    isDeviated: boolean,
    deviationDistance: number,
    currentLocation: [number, number]
  ) => {
    // 1. Update allPatients list and localStorage using functional update
    setAllPatients(prevPatients => {
      const updatedPatients = prevPatients.map(p =>
        p.id === patientId
          ? { ...p, isNavigating, isDeviated, deviationDistance, currentLocation }
          : p
      );
      // Side effect inside setState callback is generally discouraged but necessary here to ensure sync with state
      localStorage.setItem(PATIENTS_KEY, JSON.stringify(updatedPatients));
      return updatedPatients;
    });

    // 2. Update current patientData state (if logged in as the patient)
    setPatientData(prev => {
      if (prev?.id === patientId) {
        return {
          ...prev,
          isNavigating,
          isDeviated,
          deviationDistance,
          currentLocation
        };
      }
      return prev;
    });

    // 3. Update caregiver's view of linked patients
    setCaregiverData(prev => {
      if (prev) {
        const updatedCaregiverPatients = prev.patients.map(p =>
          p.id === patientId ? { ...p, isNavigating, isDeviated, deviationDistance, currentLocation } : p
        );
        return { ...prev, patients: updatedCaregiverPatients };
      }
      return prev;
    });
  }, []); // Empty dependency array ensures stable reference

  return (
    <AuthContext.Provider
      value={{
        session,
        patientData,
        caregiverData,
        allPatients,
        login,
        logout,
        updatePatientDestinations,
        updateNavigationStatus // 🟢 Added to exposed context value
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
