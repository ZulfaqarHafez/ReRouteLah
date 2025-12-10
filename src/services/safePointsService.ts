export interface SafePoint {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number];
  phone: string;
  type: 'go-to-point' | 'police' | 'hospital';
}

// Mock data for Singapore Dementia Go-To Points
const MOCK_SAFE_POINTS: SafePoint[] = [
  {
    id: 'gtp-1',
    name: 'Touch Community Services (Toa Payoh)',
    address: 'Blk 149 Toa Payoh Lorong 1 #01-943',
    coordinates: [1.3345, 103.8489],
    phone: '6258 6797',
    type: 'go-to-point'
  },
  {
    id: 'gtp-2',
    name: 'St Luke\'s ElderCare (Ang Mo Kio)',
    address: 'Blk 419 Ang Mo Kio Ave 10 #01-1059',
    coordinates: [1.3624, 103.8543],
    phone: '6459 5634',
    type: 'go-to-point'
  },
  {
    id: 'gtp-3',
    name: 'AWWA Dementia Day Care Centre',
    address: 'Blk 123 Yishun Street 11 #01-405',
    coordinates: [1.4321, 103.8345],
    phone: '6511 5200',
    type: 'go-to-point'
  },
  {
    id: 'pol-1',
    name: 'Orchard Neighbourhood Police Centre',
    address: '20 Tanglin Road',
    coordinates: [1.3065, 103.8256],
    phone: '1800 255 0000',
    type: 'police'
  }
];

// Calculate distance between two points using Haversine formula
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export const findNearestSafePoint = async (currentLocation: [number, number]): Promise<SafePoint | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  if (!currentLocation) return null;

  let nearestPoint: SafePoint | null = null;
  let minDistance = Infinity;

  MOCK_SAFE_POINTS.forEach(point => {
    const distance = getDistanceFromLatLonInKm(
      currentLocation[0],
      currentLocation[1],
      point.coordinates[0],
      point.coordinates[1]
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestPoint = point;
    }
  });

  return nearestPoint;
};
