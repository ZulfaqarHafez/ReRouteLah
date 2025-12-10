'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthSession, UserRole, PatientInfo, CaregiverInfo, SavedDestination } from '@/types';
import { mockSavedDestinations } from '@/data/mockData';
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/lib/supabase';
import { pointToCoordinates, coordinatesToPoint } from '@/lib/supabase-helpers';

interface AuthContextType {
  session: AuthSession | null;
  patientData: PatientInfo | null;
  caregiverData: CaregiverInfo | null;
  allPatients: PatientInfo[];
  login: (role: UserRole, name: string, phone?: string, pairingCode?: string) => void;
  logout: () => void;
  linkPatient: (pairingCode: string) => boolean;
  getPatientByCode: (pairingCode: string) => PatientInfo | null;
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

// 🔵 NEW: Helper to convert Supabase patient row to PatientInfo
async function dbPatientToPatientInfo(dbPatient: any, includeDestinations = true): Promise<PatientInfo> {
  const currentLocation = pointToCoordinates(dbPatient.current_location) || [1.3521, 103.8198];

  // Fetch saved destinations for this patient if needed
  let destinations: SavedDestination[] = [];
  if (includeDestinations) {
    const { data: destData } = await supabase
      .from('saved_destinations')
      .select('*')
      .eq('patient_id', dbPatient.id);

    if (destData) {
      destinations = destData.map(dest => ({
        id: dest.id,
        name: dest.name,
        address: dest.address,
        coordinates: pointToCoordinates(dest.coordinates) || [0, 0],
        icon: dest.category || '📍', // Map category to icon for UI
        category: dest.category || undefined,
      }));
    }
  }

  return {
    id: dbPatient.id,
    name: dbPatient.name,
    avatar: dbPatient.avatar || '👤',
    currentLocation: currentLocation,
    isNavigating: dbPatient.is_navigating || false,
    isDeviated: dbPatient.is_deviated || false,
    deviationDistance: dbPatient.deviation_distance || 0,
    destination: null, // Will be set separately if needed
    guardianPhone: dbPatient.guardian_phone || '',
    pairingCode: dbPatient.pairing_code || '',
    destinations: destinations.length > 0 ? destinations : mockSavedDestinations,
    profile: {
      id: dbPatient.id,
      name: dbPatient.name,
      avatar: dbPatient.avatar || '👤',
      membershipNo: `G${Date.now().toString().slice(-8)}Q`,
      phone: dbPatient.phone || '',
      nricNo: 'S****' + Math.random().toString().slice(2, 6) + 'A',
      homeAddress: '',
      postalCode: '',
    },
  };
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

  // 🔵 NEW: Real-time subscription for caregivers to get patient updates
  useEffect(() => {
    if (!session || session.role !== 'caregiver' || !caregiverData) {
      return;
    }

    const patientIds = caregiverData.patients.map(p => p.id);
    if (patientIds.length === 0) return;

    console.log('🔵 Setting up real-time subscriptions for patients:', patientIds);

    // Subscribe to patient table updates
    const channel = supabase
      .channel('caregiver-patient-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'patients',
        },
        async (payload) => {
          const updatedPatient = payload.new;

          // Only process updates for patients this caregiver is monitoring
          if (!patientIds.includes(updatedPatient.id)) return;

          console.log('📡 Received patient update:', updatedPatient.name);

          // Convert database patient to PatientInfo
          const patientInfo = await dbPatientToPatientInfo(updatedPatient, false);

          // Update allPatients state
          setAllPatients(prev =>
            prev.map(p => p.id === patientInfo.id ? patientInfo : p)
          );

          // Update caregiverData patients
          setCaregiverData(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              patients: prev.patients.map(p =>
                p.id === patientInfo.id ? patientInfo : p
              )
            };
          });

          // Show notification if patient just went off-route
          const oldPatient = payload.old;
          if (!oldPatient.is_deviated && updatedPatient.is_deviated) {
            toast({
              title: "⚠️ Route Deviation Alert",
              description: `${updatedPatient.name} has gone off-route by ${Math.round(updatedPatient.deviation_distance || 0)}m`,
              variant: "destructive",
              duration: 8000,
            });
          }

          // Show notification if patient returned to route
          if (oldPatient.is_deviated && !updatedPatient.is_deviated) {
            toast({
              title: "✅ Patient Back on Route",
              description: `${updatedPatient.name} has returned to the correct route`,
              duration: 5000,
            });
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscribed to patient updates');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Error subscribing to patient updates');
        }
      });

    // Cleanup on unmount
    return () => {
      console.log('🔵 Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [session, caregiverData]);

  const login = async (role: UserRole, name: string, phone: string = "") => {
    try {
      if (role === 'patient') {
        // 🔵 Create patient in Supabase
        const pairingCode = generateCode(); // Generate 6-character pairing code
        const { data: newPatient, error} = await supabase
          .from('patients')
          .insert({
            name,
            avatar: '👤',
            phone: phone || null,
            guardian_phone: phone || null,
            pairing_code: pairingCode,
            current_location: coordinatesToPoint([1.3521, 103.8198]),
            is_navigating: false,
            is_deviated: false,
            deviation_distance: 0,
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating patient:', error);
          toast({
            title: "Error creating patient",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        // Convert to PatientInfo
        const patientInfo = await dbPatientToPatientInfo(newPatient);

        setPatientData(patientInfo);
        setAllPatients(prev => [...prev, patientInfo]);

        const newSession: AuthSession = { role, userId: newPatient.id };
        setSession(newSession);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));

        toast({
          title: "Welcome!",
          description: `Patient account created for ${name}`,
        });

      } else {
        // Role is 'caregiver'
        // 🔵 Create caregiver in Supabase
        const { data: newCaregiver, error: caregiverError } = await supabase
          .from('caregivers')
          .insert({
            name,
            phone: phone || null,
          })
          .select()
          .single();

        if (caregiverError) {
          console.error('Error creating caregiver:', caregiverError);
          toast({
            title: "Error creating caregiver",
            description: caregiverError.message,
            variant: "destructive",
          });
          return;
        }

        // 🔵 Fetch all patients from database
        const { data: patients, error: patientsError } = await supabase
          .from('patients')
          .select('*');

        if (patientsError) {
          console.error('Error fetching patients:', patientsError);
        }

        // Convert patients to PatientInfo
        const patientInfos = patients
          ? await Promise.all(patients.map(p => dbPatientToPatientInfo(p, false)))
          : [];

        // 🔵 Fetch only patients linked to this caregiver
        const { data: linkedPatients } = await supabase
          .from('patients')
          .select('*')
          .eq('caregiver_id', newCaregiver.id);

        const linkedPatientInfos = linkedPatients
          ? await Promise.all(linkedPatients.map(p => dbPatientToPatientInfo(p, true)))
          : [];

        const caregiverInfo: CaregiverInfo = {
          id: newCaregiver.id,
          name: newCaregiver.name,
          phone: newCaregiver.phone || '',
          patients: linkedPatientInfos, // Only show linked patients
        };

        setCaregiverData(caregiverInfo);
        setAllPatients(patientInfos); // All patients for linking purposes

        // Check for deviation among linked patients and notify
        const deviatedLinkedPatient = linkedPatientInfos.find(p => p.isDeviated);
        if (deviatedLinkedPatient) {
          setTimeout(() => {
            toast({
              title: "⚠️ Alert: Patient Deviation Detected",
              description: `${deviatedLinkedPatient.name} is currently off-route by ${Math.round(deviatedLinkedPatient.deviationDistance || 0)}m.`,
              variant: "destructive",
              duration: 5000,
            });
          }, 800);
        }

        const newSession: AuthSession = {
          role,
          userId: newCaregiver.id,
          linkedPatients: linkedPatientInfos.map(p => p.id),
        };
        setSession(newSession);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));

        toast({
          title: "Welcome!",
          description: `Caregiver account created for ${name}`,
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const logout = () => {
    setSession(null);
    setPatientData(null);
    setCaregiverData(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const getPatientByCode = (pairingCode: string): PatientInfo | null => {
    return allPatients.find(p => p.pairingCode === pairingCode) || null;
  };

  const linkPatient = async (pairingCode: string): Promise<boolean> => {
    if (!session || session.role !== 'caregiver' || !caregiverData) {
      console.error('Must be logged in as caregiver to link patient');
      return false;
    }

    try {
      // Find patient with this pairing code in Supabase
      const { data: patient, error: findError } = await supabase
        .from('patients')
        .select('*')
        .eq('pairing_code', pairingCode.toUpperCase())
        .single();

      if (findError || !patient) {
        console.error('Patient not found:', findError);
        return false;
      }

      // Update patient's caregiver_id
      const { error: updateError } = await supabase
        .from('patients')
        .update({ caregiver_id: caregiverData.id })
        .eq('id', patient.id);

      if (updateError) {
        console.error('Error linking patient:', updateError);
        return false;
      }

      // Convert to PatientInfo and add to caregiver's patient list
      const patientInfo = await dbPatientToPatientInfo(patient, true);

      setCaregiverData(prev => prev ? {
        ...prev,
        patients: [...prev.patients, patientInfo]
      } : null);

      setAllPatients(prev => {
        const exists = prev.find(p => p.id === patientInfo.id);
        return exists ? prev : [...prev, patientInfo];
      });

      toast({
        title: "Patient linked!",
        description: `${patientInfo.name} has been linked to your account.`,
      });

      return true;
    } catch (error) {
      console.error('Error in linkPatient:', error);
      return false;
    }
  };

  const updatePatientDestinations = async (patientId: string, destinations: SavedDestination[]) => {
    try {
      // 🔵 First, delete all existing destinations for this patient
      const { error: deleteError } = await supabase
        .from('saved_destinations')
        .delete()
        .eq('patient_id', patientId);

      if (deleteError) {
        console.error('Error deleting old destinations:', deleteError);
      }

      // 🔵 Insert new destinations
      if (destinations.length > 0) {
        const destinationsToInsert = destinations.map(dest => ({
          patient_id: patientId,
          name: dest.name,
          address: dest.address,
          coordinates: coordinatesToPoint(dest.coordinates),
          category: dest.icon || dest.category || '📍', // Save icon as category
        }));

        const { error: insertError } = await supabase
          .from('saved_destinations')
          .insert(destinationsToInsert);

        if (insertError) {
          console.error('Error inserting destinations:', insertError);
          toast({
            title: "Error saving destinations",
            description: insertError.message,
            variant: "destructive",
          });
          return;
        }
      }

      // Update local state
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

      toast({
        title: "Destinations saved",
        description: "Your saved places have been updated.",
      });
    } catch (error) {
      console.error('Error updating destinations:', error);
      toast({
        title: "Error saving destinations",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  // 🔵 NEW: Update navigation status in both Supabase and local state
  const updateNavigationStatus = React.useCallback(async (
    patientId: string,
    isNavigating: boolean,
    isDeviated: boolean,
    deviationDistance: number,
    currentLocation: [number, number]
  ) => {
    try {
      // 🔵 Update in Supabase first
      const { error } = await supabase
        .from('patients')
        .update({
          is_navigating: isNavigating,
          is_deviated: isDeviated,
          deviation_distance: deviationDistance,
          current_location: coordinatesToPoint(currentLocation),
          last_location_update: new Date().toISOString(),
        })
        .eq('id', patientId);

      if (error) {
        console.error('Error updating patient navigation status:', error);
        // Continue with local update even if Supabase fails
      }

      // 🔵 If patient just went off-route, log it in route_deviations table
      if (isDeviated && deviationDistance > 0) {
        const { error: deviationError } = await supabase
          .from('route_deviations')
          .insert({
            patient_id: patientId,
            deviation_distance: deviationDistance,
            location: coordinatesToPoint(currentLocation),
          });

        if (deviationError) {
          console.error('Error logging route deviation:', deviationError);
        }
      }

      // 1. Update allPatients list and localStorage using functional update
      setAllPatients(prevPatients => {
        const updatedPatients = prevPatients.map(p =>
          p.id === patientId
            ? { ...p, isNavigating, isDeviated, deviationDistance, currentLocation }
            : p
        );
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
    } catch (error) {
      console.error('Error in updateNavigationStatus:', error);
    }
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
        linkPatient,
        getPatientByCode,
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
