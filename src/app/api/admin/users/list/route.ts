import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import { User } from '@/models/User';
import { decrypt } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('session');
    if (!sessionCookie) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const payload = await decrypt(sessionCookie.value);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    await connectDB();
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });

    return NextResponse.json({ users }, { status: 200 });

  } catch (error) {
    console.error('List users error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
