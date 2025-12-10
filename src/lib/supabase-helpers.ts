// Helper functions for working with Supabase and PostgreSQL types

/**
 * Convert PostgreSQL POINT to [latitude, longitude] tuple
 */
export function pointToCoordinates(point: unknown): [number, number] | null {
  if (!point) return null;

  // PostgreSQL POINT format is "(x,y)" where x is longitude and y is latitude
  const pointStr = String(point);
  const match = pointStr.match(/\(([^,]+),([^)]+)\)/);

  if (match) {
    const lng = parseFloat(match[1]);
    const lat = parseFloat(match[2]);
    return [lat, lng]; // Return as [latitude, longitude]
  }

  return null;
}

/**
 * Convert [latitude, longitude] tuple to PostgreSQL POINT string
 */
export function coordinatesToPoint(coords: [number, number] | null): string | null {
  if (!coords || coords.length !== 2) return null;

  const [lat, lng] = coords;
  // PostgreSQL POINT format: (longitude, latitude)
  return `(${lng},${lat})`;
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: string | null): Date | null {
  if (!timestamp) return null;
  return new Date(timestamp);
}

/**
 * Check if a timestamp is recent (within last N seconds)
 */
export function isRecentUpdate(timestamp: string | null, seconds: number = 30): boolean {
  if (!timestamp) return false;
  const now = new Date().getTime();
  const updateTime = new Date(timestamp).getTime();
  return (now - updateTime) / 1000 < seconds;
}
