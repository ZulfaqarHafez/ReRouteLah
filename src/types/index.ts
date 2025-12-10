export type UserRole = "patient" | "caregiver";

export interface SavedDestination {
  id: string;
  name: string;
  address: string;
  icon?: string; // Optional - shown in UI
  category?: string; // Optional - stored in database (same as icon)
  coordinates: [number, number];
}

export interface PatientProfile {
  id: string;
  name: string;
  avatar: string;
  membershipNo: string;
  phone: string;
  nricNo: string;
  homeAddress: string;
  postalCode: string;
}

export interface PatientInfo {
  id: string;
  name: string;
  avatar: string;
  currentLocation: [number, number];
  isNavigating: boolean;
  destination: SavedDestination | null;
  guardianPhone: string;
  profile: PatientProfile;
  pairingCode: string;
  destinations: SavedDestination[];
  isDeviated: boolean;
  deviationDistance: number;
}

export interface CaregiverInfo {
  id: string;
  name: string;
  phone: string;
  patients: PatientInfo[];
}

export interface AuthSession {
  role: UserRole;
  userId: string;
  linkedPatients?: string[]; // For caregivers - patient IDs they're linked to
}
