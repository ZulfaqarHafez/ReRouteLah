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

// Helper function to find bus route using LTA API
async function findBusRoute(startLat, startLng, endLat, endLng, apiKey) {
  try {
    // 1. Fetch bus stops near start and end
    const stopsRes = await fetch('https://datamall2.mytransport.sg/ltaodataservice/BusStops', {
      headers: { 'AccountKey': apiKey, 'accept': 'application/json' }
    });
    const stopsData = await stopsRes.json();
    const allStops = stopsData.value || [];

    const startStops = allStops.filter(s => getDistanceFromLatLonInKm(startLat, startLng, s.Latitude, s.Longitude) < 0.5);
    const endStops = allStops.filter(s => getDistanceFromLatLonInKm(endLat, endLng, s.Latitude, s.Longitude) < 0.5);

    if (startStops.length === 0 || endStops.length === 0) {
      return null;
    }

    // 2. Fetch bus routes
    const routesRes = await fetch('https://datamall2.mytransport.sg/ltaodataservice/BusRoutes', {
      headers: { 'AccountKey': apiKey, 'accept': 'application/json' }
    });
    const routesData = await routesRes.json();
    const allRoutes = routesData.value || [];

    // 3. Find matching bus route
    for (const startStop of startStops) {
      const servicesAtStart = allRoutes.filter(r => r.BusStopCode === startStop.BusStopCode);

      for (const service of servicesAtStart) {
        const matchingEndStop = allRoutes.find(r =>
          r.ServiceNo === service.ServiceNo &&
          r.Direction === service.Direction &&
          endStops.some(es => es.BusStopCode === r.BusStopCode) &&
          r.StopSequence > service.StopSequence
        );

        if (matchingEndStop) {
          return {
            busNumber: service.ServiceNo,
            boardStop: startStop.Description,
            boardStopCode: startStop.BusStopCode,
            alightStop: endStops.find(es => es.BusStopCode === matchingEndStop.BusStopCode).Description,
            alightStopCode: matchingEndStop.BusStopCode,
            stopsCount: matchingEndStop.StopSequence - service.StopSequence
          };
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error finding bus route:', error);
    return null;
  }
}

// 🚌 NEW: Support POST method for navigation steps with LTA API
export async function POST(request) {
  try {
    const body = await request.json();
    const { start, end, destination } = body;

    if (!start || !end || !Array.isArray(start) || !Array.isArray(end)) {
      return NextResponse.json({ error: 'Invalid coordinates format' }, { status: 400 });
    }

    const [startLat, startLng] = start;
    const [endLat, endLng] = end;
    const apiKey = process.env.LTA_API_KEY;

    if (!apiKey) {
      console.log('LTA_API_KEY not configured, skipping LTA route planner');
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Calculate distance
    const distance = getDistanceFromLatLonInKm(startLat, startLng, endLat, endLng);
    const distanceMeters = distance * 1000;

    // Try to find bus route using LTA API
    const busRoute = await findBusRoute(startLat, startLng, endLat, endLng, apiKey);

    if (busRoute) {
      // ✅ Generate navigation steps with actual bus information from LTA
      const steps = [
        {
          id: 1,
          direction: 'straight',
          instruction: `Walk to ${busRoute.boardStop}`,
          distance: '3 mins'
        },
        {
          id: 2,
          direction: 'bus', // Real bus route from LTA API
          instruction: `Take Bus ${busRoute.busNumber} towards ${destination || 'destination'}`,
          distance: `${busRoute.stopsCount} stops`
        },
        {
          id: 3,
          direction: 'straight',
          instruction: `Alight at ${busRoute.alightStop}`,
          distance: '1 min'
        },
        {
          id: 4,
          direction: 'destination',
          instruction: 'You have arrived!',
          distance: ''
        }
      ];

      // Generate simple path
      const path = [start, end];

      console.log(`✅ Found LTA bus route: Bus ${busRoute.busNumber} from ${busRoute.boardStop} to ${busRoute.alightStop}`);

      return NextResponse.json({
        steps,
        path,
        transportMode: 'bus',
        busNumber: busRoute.busNumber
      });
    }

    // No bus route found, return 404 to let OSRM handle it
    console.log('No LTA bus route found, falling back to OSRM');
    return NextResponse.json({ message: 'No LTA route found, use fallback' }, { status: 404 });

  } catch (error) {
    console.error('Route planner error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Keep GET for backward compatibility
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
    const busRoute = await findBusRoute(startLat, startLng, destLat, destLng, apiKey);

    if (busRoute) {
      return NextResponse.json(busRoute);
    } else {
      return NextResponse.json({ message: "No direct bus found." });
    }

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
