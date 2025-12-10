import { SavedDestination, PatientInfo, CaregiverInfo } from "@/types/app";

export const mockSavedDestinations: SavedDestination[] = [
  {
    id: "1",
    name: "Home",
    address: "123 Clementi Ave 3, Singapore 129905",
    icon: "🏠",
    coordinates: [1.3147, 103.7650],
  },
  {
    id: "2",
    name: "Day Centre",
    address: "45 Toa Payoh Lorong 5, Singapore 319454",
    icon: "🏢",
    coordinates: [1.3343, 103.8494],
  },
  {
    id: "3",
    name: "Grandma's House",
    address: "78 Bedok North Ave 4, Singapore 469662",
    icon: "👵",
    coordinates: [1.3276, 103.9305],
  },
  {
    id: "4",
    name: "Shopping Mall",
    address: "VivoCity, 1 HarbourFront Walk, Singapore 098585",
    icon: "🛍️",
    coordinates: [1.2644, 103.8223],
  },
];

export const mockPatient: PatientInfo = {
  id: "patient-1",
  name: "Alex",
  avatar: "👤",
  currentLocation: [1.3521, 103.8198],
  isNavigating: false,
  destination: null,
  guardianPhone: "+6598765432",
  pairingCode: "ABC123",
  destinations: mockSavedDestinations,
  profile: {
    id: "patient-1",
    name: "Eliza Wong",
    avatar: "👤",
    membershipNo: "G14481990Q",
    phone: "9123 4567",
    nricNo: "S9876543A",
    homeAddress: "Blk 123A Punggol Ave 67 #10-15",
    postalCode: "S123456",
  },
};

export const mockCaregiver: CaregiverInfo = {
  id: "caregiver-1",
  name: "Andrew Wong",
  phone: "+6598765432",
  patients: [mockPatient],
};
