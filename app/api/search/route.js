import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  try {
    // OneMap Search API (Public Endpoint)
    // We ask for geometry (coordinates) and address details
    const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(query)}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;
    
    const res = await fetch(url);
    const data = await res.json();

    // The API returns { found: number, results: [...] }
    return NextResponse.json(data);

  } catch (error) {
    console.error("Search Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}