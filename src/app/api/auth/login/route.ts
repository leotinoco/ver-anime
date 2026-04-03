import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import { User } from '@/models/User';
import { verifyPassword, encrypt } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { identifier: rawIdentifier, password } = await req.json();

    if (!rawIdentifier || !password) {
      return NextResponse.json({ error: 'Usuario/Email y contraseña son obligatorios' }, { status: 400 });
    }

    const identifier = rawIdentifier.trim();

    console.log(`[LOGIN] Attempting to connect to DB`);
    await connectDB();

    // Accept login via email OR username
    console.log(`[LOGIN] Searching user for identifier: ${identifier}`);
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier },
      ],
    });
    if (!user) {
      console.log(`[LOGIN] User not found: ${identifier}`);
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    console.log(`[LOGIN] User found, verifying password`);
    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      console.log(`[LOGIN] Password mismatch for: ${identifier}`);
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const sessionData = {
      userId: user.id || (user._id ? user._id.toString() : undefined),
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar || undefined,
    };

    console.log(`[LOGIN] User verified. Session data:`, sessionData);
    
    if (!sessionData.userId) {
       console.error(`[LOGIN] userId is missing from user object`);
       throw new Error('User ID is missing');
    }

    console.log(`[LOGIN] Encrypting session`);
    const sessionString = await encrypt(sessionData as any);

    const response = NextResponse.json({ user: sessionData, success: true }, { status: 200 });
    
    // Set cookie with strict attributes
    response.cookies.set({
      name: 'session',
      value: sessionString,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' || req.url.startsWith('https://'),
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    console.log(`[LOGIN] Login successful for: ${identifier}`);
    return response;

  } catch (error: any) {
    console.error('Login error detailed:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: error.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
