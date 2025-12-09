import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.LTA_API_KEY;
  try {
    // Note: LTA returns 500 records at a time. In a real app, you loop with $skip.
    // For this route, we just fetch the first batch.
    const response = await fetch('https://datamall2.mytransport.sg/ltaodataservice/BusStops', {
      headers: { 'AccountKey': apiKey, 'accept': 'application/json' }
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}