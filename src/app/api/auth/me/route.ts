import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('session');
    
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const payload = await decrypt(sessionCookie.value);

    if (!payload) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ 
      authenticated: true, 
      user: {
        userId: payload.userId,
        username: payload.username,
        email: payload.email,
        role: payload.role,
        avatar: payload.avatar,
      } 
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ authenticated: false, error: 'Failed to authenticate' }, { status: 401 });
  }
}
