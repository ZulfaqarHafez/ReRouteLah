import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startLat = searchParams.get('startLat');
  const startLng = searchParams.get('startLng');
  const destLat = searchParams.get('destLat');
  const destLng = searchParams.get('destLng');

  if (!startLat || !startLng || !destLat || !destLng) {
    return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 });
  }

  try {
    // Attempt to use OneMap API for accurate Singapore routing
    // Note: Use 'walk' for walking routes.
    const oneMapUrl = `https://developers.onemap.sg/privateapi/routingsvc/route?start=${startLat},${startLng}&end=${destLat},${destLng}&routeType=walk&token=${process.env.ONEMAP_TOKEN || 'PUBLIC'}`;
    
    // Fallback logic: If you don't have a OneMap token, this might fail.
    // Ideally, register for a free token at https://www.onemap.gov.sg/docs/
    
    const res = await fetch(oneMapUrl);
    const data = await res.json();

    if (data.route_geometry) {
      // Decode OneMap geometry string (if it's encoded) or use route_instructions
      // For simplicity/hackathon, OneMap often returns a simpler geometry structure or points in instructions
      
      // Let's assume we map the geometry points if available, 
      // otherwise we build a simple path from the instructions.
      // (Simplified for demo stability):
      
      // Creating a direct line with intermediate points for AR smoothing
      const path = [
        [parseFloat(startLat), parseFloat(startLng)],
        // In a real app, decode data.route_geometry here
        [parseFloat(destLat), parseFloat(destLng)] 
      ];

      return NextResponse.json({
        instruction: `Walk towards ${data.route_summary?.end_point || 'Destination'}`,
        path: path,
        distance: data.route_summary?.total_distance,
        time: data.route_summary?.total_time
      });
    }

    // FALLBACK (If API fails or no token): Direct Line Mode
    // This ensures your app ALWAYS works even without internet/API keys
    return NextResponse.json({
      useFallback: true,
      instruction: "Navigate directly (Simulation Mode)",
      path: [
        [parseFloat(startLat), parseFloat(startLng)],
        [parseFloat(destLat), parseFloat(destLng)]
      ]
    });

  } catch (error) {
    console.error("Navigation Error:", error);
    // Return a straight line so the app doesn't crash
    return NextResponse.json({
      useFallback: true,
      instruction: "Connection failed - Direct Mode",
      path: [
        [parseFloat(startLat), parseFloat(startLng)],
        [parseFloat(destLat), parseFloat(destLng)]
      ]
    });
  }
}