import { NextResponse } from 'next/server';

// Helper to calculate distance between two coords
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const startLat = parseFloat(searchParams.get('startLat'));
  const startLng = parseFloat(searchParams.get('startLng'));
  const destLat = parseFloat(searchParams.get('destLat'));
  const destLng = parseFloat(searchParams.get('destLng'));
  const apiKey = process.env.LTA_API_KEY;

  if (!startLat || !startLng || !destLat || !destLng) {
    return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 });
  }

  try {
    // 1. Fetch ALL Bus Stops (In a real app, cache this!)
    // For Hackathon demo, we might just fetch the first 500 or assume we have a local JSON.
    // OPTIMIZATION: Just fetching nearby stops is hard without a geospatial database.
    // SIMPLIFICATION: We will fetch the first batch from LTA. If your stop isn't in the first 500, this demo might miss it.
    // BETTER HACKATHON FIX: Use a hardcoded subset or fetch multiple pages if possible.
    
    // Let's assume we fetch one batch for the demo
    const stopsRes = await fetch('https://datamall2.mytransport.sg/ltaodataservice/BusStops', {
      headers: { 'AccountKey': apiKey, 'accept': 'application/json' }
    });
    const stopsData = await stopsRes.json();
    const allStops = stopsData.value || [];

    // 2. Find Stops near Start & End (within 500m)
    const startStops = allStops.filter(s => getDistanceFromLatLonInKm(startLat, startLng, s.Latitude, s.Longitude) < 0.5);
    const endStops = allStops.filter(s => getDistanceFromLatLonInKm(destLat, destLng, s.Latitude, s.Longitude) < 0.5);

    if (startStops.length === 0 || endStops.length === 0) {
       return NextResponse.json({ error: "No bus stops found near locations (Try locations in first 500 LTA stops for demo)" }, { status: 404 });
    }

    // 3. Fetch Bus Routes to see which services connect them
    // This is a heavy call. In production, you'd database this.
    const routesRes = await fetch('https://datamall2.mytransport.sg/ltaodataservice/BusRoutes', {
      headers: { 'AccountKey': apiKey, 'accept': 'application/json' }
    });
    const routesData = await routesRes.json();
    const allRoutes = routesData.value || [];

    // 4. Match Logic
    let bestRoute = null;

    // For every stop near user
    for (const startStop of startStops) {
        // Find all buses that pass through this start stop
        const servicesAtStart = allRoutes.filter(r => r.BusStopCode === startStop.BusStopCode);

        for (const service of servicesAtStart) {
            // Check if this bus also goes to any of the end stops
            // AND ensure the sequence number is higher (Start < End)
            const matchingEndStop = allRoutes.find(r => 
                r.ServiceNo === service.ServiceNo && 
                r.Direction === service.Direction &&
                endStops.some(es => es.BusStopCode === r.BusStopCode) &&
                r.StopSequence > service.StopSequence
            );

            if (matchingEndStop) {
                // Found a valid route!
                bestRoute = {
                    busNumber: service.ServiceNo,
                    boardStop: startStop.Description,
                    boardStopCode: startStop.BusStopCode,
                    alightStop: endStops.find(es => es.BusStopCode === matchingEndStop.BusStopCode).Description,
                    alightStopCode: matchingEndStop.BusStopCode,
                    stopsCount: matchingEndStop.StopSequence - service.StopSequence
                };
                break; // Found one, let's return (greedy approach)
            }
        }
        if (bestRoute) break;
    }

    if (bestRoute) {
        return NextResponse.json(bestRoute);
    } else {
        return NextResponse.json({ message: "No direct bus found." });
    }

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}