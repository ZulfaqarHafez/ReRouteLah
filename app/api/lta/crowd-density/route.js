import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const trainLine = searchParams.get('line') || 'EWL'; // Default to East-West Line if not specified

  const LTA_API_KEY = process.env.LTA_API_KEY; // ⚠️ USE YOUR KEY

  try {
    // API supports: CCL, CEL, CGL, DTL, EWL, NEL, NSL, BPL, SLRT, PLRT, TEL
    const response = await fetch(
      `https://datamall2.mytransport.sg/ltaodataservice/PCDRealTime?TrainLine=${trainLine}`,
      {
        headers: { 'AccountKey': LTA_API_KEY, 'accept': 'application/json' }
      }
    );

    if (!response.ok) throw new Error('LTA API Failed');
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}