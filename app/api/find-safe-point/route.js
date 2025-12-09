import { NextResponse } from 'next/server';
import { dementiaPoints } from '@/app/data/dementiaPoints';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat'));
  const lng = parseFloat(searchParams.get('lng'));

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 });
  }

  try {
    let closestPoint = null;
    let minDistance = Infinity;

    // Haversine formula to find nearest point
    dementiaPoints.forEach((point) => {
        const R = 6371e3; // Earth radius in meters
        const φ1 = lat * Math.PI / 180;
        const φ2 = point.lat * Math.PI / 180;
        const Δφ = (point.lat - lat) * Math.PI / 180;
        const Δλ = (point.lng - lng) * Math.PI / 180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;

        if (distance < minDistance) {
            minDistance = distance;
            closestPoint = point;
        }
    });

    return NextResponse.json({ 
        ...closestPoint,
        distance: Math.round(minDistance) // Send distance in meters
    });

  } catch (error) {
    console.error("Safe Point Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}