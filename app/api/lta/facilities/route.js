import { NextResponse } from 'next/server';

export async function GET() {
  const LTA_API_KEY = process.env.LTA_API_KEY; // ⚠️ USE YOUR KEY

  try {
    // Using v2 as per documentation for Lift Maintenance
    const response = await fetch(
      'https://datamall2.mytransport.sg/ltaodataservice/v2/FacilitiesMaintenance',
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