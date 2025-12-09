import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.LTA_API_KEY;
  try {
    const response = await fetch('https://datamall2.mytransport.sg/ltaodataservice/BusRoutes', {
      headers: { 'AccountKey': apiKey, 'accept': 'application/json' }
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}