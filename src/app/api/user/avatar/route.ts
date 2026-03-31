import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import { User } from '@/models/User';
import { decrypt, encrypt } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('session');
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const payload = await decrypt(sessionCookie.value);
    if (!payload) {
      return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });
    }

    const { avatar } = await req.json();
    if (!avatar) {
      return NextResponse.json({ error: 'Avatar es requerido' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Update avatar in DB
    user.avatar = avatar;
    await user.save();

    // Create new session data with the updated avatar
    const newSessionData = {
      ...payload,
      avatar: avatar
    };

    const sessionString = await encrypt(newSessionData as any);

    const response = NextResponse.json({ 
      success: true, 
      user: {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });

    // Update cookie
    response.cookies.set({
      name: 'session',
      value: sessionString,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' || req.url.startsWith('https://'),
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;

  } catch (error) {
    console.error('[API_USER_AVATAR] Error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
