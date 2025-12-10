import { useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { pointToCoordinates } from '@/lib/supabase-helpers';

/**
 * Real-time subscription hook for patient updates
 * Caregivers use this to get live updates when patients move or go off-route
 */
export function useRealtimePatients() {
  const { caregiverData, session } = useAuth();

  const handlePatientUpdate = useCallback((payload: any) => {
    const updatedPatient = payload.new;

    // Check if patient just went off-route
    const wasDeviated = payload.old?.is_deviated;
    const isNowDeviated = updatedPatient.is_deviated;

    if (!wasDeviated && isNowDeviated) {
      // Patient just went off-route - show alert
      toast({
        title: "⚠️ Route Deviation Alert",
        description: `${updatedPatient.name} has gone off-route by ${Math.round(updatedPatient.deviation_distance || 0)}m`,
        variant: "destructive",
        duration: 8000,
      });
    }

    // Check if patient returned to route
    if (wasDeviated && !isNowDeviated) {
      toast({
        title: "✅ Patient Back on Route",
        description: `${updatedPatient.name} has returned to the correct route`,
        duration: 5000,
      });
    }
  }, []);

  useEffect(() => {
    // Only subscribe if logged in as caregiver
    if (!caregiverData || session?.role !== 'caregiver') {
      return;
    }

    // Get IDs of all patients this caregiver is linked to
    const patientIds = caregiverData.patients.map(p => p.id);

    if (patientIds.length === 0) {
      return;
    }

    console.log('🔵 Setting up real-time subscriptions for patients:', patientIds);

    // Subscribe to changes in the patients table
    const channel = supabase
      .channel('patient-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'patients',
          filter: `id=in.(${patientIds.join(',')})`,
        },
        handlePatientUpdate
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscribed to patient updates');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Error subscribing to patient updates');
        }
      });

    // Cleanup subscription on unmount
    return () => {
      console.log('🔵 Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [caregiverData, session, handlePatientUpdate]);
}
