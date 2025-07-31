import { NextRequest, NextResponse } from 'next/server';

// OIDC Configuration
const OIDC_ISSUER = 'https://oidc.vercel.com/dharsan-kumars-projects';
const OIDC_AUDIENCE = 'https://vercel.com/dharsan-kumars-projects';
const BACKEND_BASE_URL = 'http://34.70.216.41:8001';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'DELETE');
}

async function handleRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    // Get the OIDC token from the request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Verify the OIDC token
    const isValidToken = await verifyOIDCToken(token);
    if (!isValidToken) {
      return NextResponse.json(
        { error: 'Invalid OIDC token' },
        { status: 401 }
      );
    }

    // Construct the backend URL
    const path = pathSegments.join('/');
    const backendUrl = `${BACKEND_BASE_URL}/${path}`;
    
    // Get query parameters
    const url = new URL(request.url);
    const queryString = url.searchParams.toString();
    const fullBackendUrl = queryString ? `${backendUrl}?${queryString}` : backendUrl;

    // Prepare headers for backend request
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Vercel-Proxy/1.0',
    };

    // Copy relevant headers from the original request
    const relevantHeaders = ['x-session-id', 'x-request-id', 'accept'];
    relevantHeaders.forEach(header => {
      const value = request.headers.get(header);
      if (value) {
        headers[header] = value;
      }
    });

    // Make the request to the backend
    const response = await fetch(fullBackendUrl, {
      method,
      headers,
      body: method !== 'GET' ? await request.text() : undefined,
    });

    // Get the response data
    const data = await response.text();
    
    // Create response headers
    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', response.headers.get('content-type') || 'application/json');
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return new NextResponse(data, {
      status: response.status,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('Backend proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function verifyOIDCToken(token: string): Promise<boolean> {
  try {
    // In a production environment, you would verify the JWT token
    // For now, we'll do basic validation
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    // Decode the payload (base64url decode)
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    
    // Check issuer
    if (payload.iss !== OIDC_ISSUER) {
      return false;
    }

    // Check audience
    if (payload.aud !== OIDC_AUDIENCE) {
      return false;
    }

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return false;
    }

    // Check not before
    if (payload.nbf && payload.nbf > now) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Session-ID, X-Request-ID',
    },
  });
} 