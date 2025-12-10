'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthSession, UserRole, PatientInfo, CaregiverInfo, SavedDestination } from '@/types/app';
import { mockSavedDestinations } from '@/data/mockData';

interface AuthContextType {
  session: AuthSession | null;
  patientData: PatientInfo | null;
  caregiverData: CaregiverInfo | null;
  allPatients: PatientInfo[];
  login: (role: UserRole, name: string, phone?: string) => void;
  logout: () => void;
  generatePairingCode: () => string;
  linkPatient: (pairingCode: string) => boolean;
  updatePatientDestinations: (patientId: string, destinations: SavedDestination[]) => void;
  getPatientByCode: (code: string) => PatientInfo | null;
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

  const login = (role: UserRole, name: string, phone?: string) => {
    const userId = generateId();
    
    if (role === 'patient') {
      const pairingCode = generateCode();
      const newPatient: PatientInfo = {
        id: userId,
        name,
        avatar: '👤',
        currentLocation: [1.3521, 103.8198],
        isNavigating: false,
        destination: null,
        guardianPhone: phone || '',
        pairingCode,
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

    } else {
      const newCaregiver: CaregiverInfo = {
        id: userId,
        name,
        phone: phone || '',
        patients: [],
      };

      const savedCaregivers = localStorage.getItem(CAREGIVERS_KEY);
      const caregivers: CaregiverInfo[] = savedCaregivers ? JSON.parse(savedCaregivers) : [];
      caregivers.push(newCaregiver);
      localStorage.setItem(CAREGIVERS_KEY, JSON.stringify(caregivers));

      setCaregiverData(newCaregiver);

      const newSession: AuthSession = { role, userId, linkedPatients: [] };
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

  const generatePairingCode = (): string => {
    if (patientData) {
      return patientData.pairingCode;
    }
    return '';
  };

  const getPatientByCode = (code: string): PatientInfo | null => {
    return allPatients.find(p => p.pairingCode === code) || null;
  };

  const linkPatient = (pairingCode: string): boolean => {
    const patient = allPatients.find(p => p.pairingCode === pairingCode);
    if (!patient || !session || session.role !== 'caregiver') return false;

    // Check if already linked
    if (session.linkedPatients?.includes(patient.id)) return true;

    const updatedLinkedPatients = [...(session.linkedPatients || []), patient.id];
    const updatedSession = { ...session, linkedPatients: updatedLinkedPatients };
    setSession(updatedSession);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSession));

    // Update caregiver data
    if (caregiverData) {
      const updatedCaregiver = {
        ...caregiverData,
        patients: [...caregiverData.patients, patient],
      };
      setCaregiverData(updatedCaregiver);

      // Persist caregiver
      const savedCaregivers = localStorage.getItem(CAREGIVERS_KEY);
      const caregivers: CaregiverInfo[] = savedCaregivers ? JSON.parse(savedCaregivers) : [];
      const idx = caregivers.findIndex(c => c.id === caregiverData.id);
      if (idx >= 0) {
        caregivers[idx] = updatedCaregiver;
        localStorage.setItem(CAREGIVERS_KEY, JSON.stringify(caregivers));
      }
    }

    return true;
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

  return (
    <AuthContext.Provider
      value={{
        session,
        patientData,
        caregiverData,
        allPatients,
        login,
        logout,
        generatePairingCode,
        linkPatient,
        updatePatientDestinations,
        getPatientByCode,
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
