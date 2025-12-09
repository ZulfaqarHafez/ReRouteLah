// app/api/lta/bus-arrival/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const busStopCode = searchParams.get('code') || '83139'; // Default to a test stop if none provided

  const LTA_API_KEY = process.env.LTA_API_KEY;// ⚠️ REPLACE THIS!

  try {
    const response = await fetch(
      // LTA Bus Arrival Endpoint 
      `https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=${busStopCode}`,
      {
        headers: {
          'AccountKey': LTA_API_KEY, // Mandatory Header [cite: 73, 82]
          'accept': 'application/json' // Default format [cite: 74]
        },
      }
    );

    if (!response.ok) {
      throw new Error(`LTA API Error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}