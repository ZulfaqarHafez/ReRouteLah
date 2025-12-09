import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const startLat = searchParams.get('startLat');
  const startLng = searchParams.get('startLng');
  const destLat = searchParams.get('destLat');
  const destLng = searchParams.get('destLng');

  // KEEP YOUR ONEMAP TOKEN HERE
  const ONEMAP_TOKEN = process.env.ONEMAP_TOKEN;;

  if (!startLat || !startLng || !destLat || !destLng) {
    return NextResponse.json({ error: 'Missing coordDinates' }, { status: 400 });
  }

  try {
    // --- STRATEGY 1: TRY ONEMAP (Best for Singapore) ---
    console.log("Attempting OneMap...");
    try {
        const oneMapUrl = `https://www.onemap.gov.sg/api/public/routing/route?start=${startLat},${startLng}&end=${destLat},${destLng}&routeType=walk&geometryFormat=geojson&token=${ONEMAP_TOKEN}`;
        const res = await fetch(oneMapUrl);
        const data = await res.json();

        // Check if OneMap gave us a valid route
        if (!data.error && data.route_instructions && data.route_instructions.length > 0) {
            // Success with OneMap!
            let path = [];
            if (data.route_geometry && data.route_geometry.coordinates) {
                path = data.route_geometry.coordinates.map(coord => [coord[1], coord[0]]); // Swap lng,lat to lat,lng
            }

            const nextStep = data.route_instructions.length > 1 ? data.route_instructions[1] : data.route_instructions[0];
            const instructionText = nextStep[0];
            const coordsString = nextStep[5];
            const [stepLat, stepLng] = coordsString.split(',');

            return NextResponse.json({
                latitude: parseFloat(stepLat),
                longitude: parseFloat(stepLng),
                instruction: instructionText,
                distance: data.route_summary.total_distance,
                path: path
            });
        }
    } catch (omError) {
        console.warn("OneMap Failed:", omError);
    }

    // --- STRATEGY 2: FALLBACK TO OSRM (Global, Forgiving) ---
    console.log("OneMap failed/empty, falling back to OSRM...");

    // OSRM uses {lng},{lat} format - also request steps with better detail
    const osrmUrl = `https://router.project-osrm.org/route/v1/foot/${startLng},${startLat};${destLng},${destLat}?overview=full&geometries=geojson&steps=true`;

    const osrmRes = await fetch(osrmUrl);
    const osrmData = await osrmRes.json();

    if (osrmData.routes && osrmData.routes.length > 0) {
        const route = osrmData.routes[0];

        // Extract Path (GeoJSON is [lng, lat], we need [lat, lng])
        const path = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);

        // Check if we have route legs
        if (route.legs && route.legs.length > 0) {
            const firstLeg = route.legs[0];

            // Try to get detailed turn-by-turn steps
            if (firstLeg.steps && firstLeg.steps.length > 0) {
                // Extract Next Turn (First step of first leg)
                let nextStep = firstLeg.steps[0];

                // Try to get the second step if available (first step is usually just "depart")
                if (firstLeg.steps.length > 1) {
                    nextStep = firstLeg.steps[1];
                }

                return NextResponse.json({
                    latitude: nextStep.maneuver.location[1],
                    longitude: nextStep.maneuver.location[0],
                    instruction: (nextStep.maneuver.type || "Go") + " " + (nextStep.maneuver.modifier || ""), // e.g. "turn right"
                    distance: route.distance,
                    path: path,
                    source: "OSRM (Fallback)"
                });
            } else {
                // No detailed steps, but we have a route path - use destination as target
                console.log("OSRM returned route without detailed steps, using simplified mode");

                // Use a point along the path if available, otherwise destination
                let targetLat = parseFloat(destLat);
                let targetLng = parseFloat(destLng);

                // If we have a path with multiple points, use a nearby waypoint
                if (path.length > 1) {
                    // Use the 2nd or 3rd point if available (not the starting point)
                    const waypointIndex = Math.min(2, path.length - 1);
                    targetLat = path[waypointIndex][0];
                    targetLng = path[waypointIndex][1];
                }

                return NextResponse.json({
                    latitude: targetLat,
                    longitude: targetLng,
                    instruction: "Follow the path",
                    distance: route.distance,
                    path: path,
                    source: "OSRM (Simplified)"
                });
            }
        }
    }

    // --- STRATEGY 3: FINAL FALLBACK (Straight Line) ---
    console.log("Both providers failed. Using Straight Line.");
    throw new Error("No route found on any provider");

  } catch (error) {
    console.error("Routing Error:", error);
    // Return a flag to tell Frontend to draw a straight line
    return NextResponse.json({ error: error.message || "Unknown error", useFallback: true }, { status: 200 });
  }
}
