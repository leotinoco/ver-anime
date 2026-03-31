import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://animeflv.ahmedrangel.com/api';

export async function GET(
  request: NextRequest,
  // We cannot use directly params like destructuring in Next 15 without awaiting unless we check types carefully.
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    
    // Check if path exists or default to empty array
    const pathArray = resolvedParams?.path || [];
    
    // Join the remaining path segments to create the destination URL
    const destinationPath = pathArray.join('/');
    const searchParams = request.nextUrl.searchParams.toString();
    
    // Construct the full URL to the third-party API
    const url = `${API_BASE}/${destinationPath}${searchParams ? `?${searchParams}` : ''}`;
    
    const response = await fetch(url, {
      // Revalidate based on the type of request. 
      // 3600 seconds = 1 hour default cache for standard proxy requests
      next: { revalidate: 3600 },
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch from AnimeFLV API' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const headers = new Headers();
    headers.set('Cache-Control', 's-maxage=3600, stale-while-revalidate');

    return NextResponse.json(data, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Proxy Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error fetching from third party API' },
      { status: 500 }
    );
  }
}
