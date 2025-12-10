import { dementiaPoints } from '../../app/data/dementiaPoints';

export interface SafePoint {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number];
  phone: string;
  type: 'go-to-point' | 'police' | 'hospital';
}

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

  dementiaPoints.forEach((point, index) => {
    const distance = getDistanceFromLatLonInKm(
      currentLocation[0],
      currentLocation[1],
      point.lat,
      point.lng
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestPoint = {
        id: `gtp-${index}`,
        name: point.name,
        address: point.address,
        coordinates: [point.lat, point.lng],
        phone: '999', // Default emergency number or specific if available
        type: 'go-to-point'
      };
    }
  });

  return nearestPoint;
};
