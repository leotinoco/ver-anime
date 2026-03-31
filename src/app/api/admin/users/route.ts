import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import { User } from '@/models/User';
import { hashPassword, decrypt } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // 1. Verify session and admin role
    const sessionCookie = req.cookies.get('session');
    if (!sessionCookie) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const payload = await decrypt(sessionCookie.value);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // 2. Parse request body
    const { username, email, password, role } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    await connectDB();

    // 3. Check for existing user
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return NextResponse.json({ error: 'El usuario o email ya existe' }, { status: 400 });
    }

    // 4. Create new user
    const passwordHash = await hashPassword(password);
    const newUser = await User.create({
      username,
      email,
      passwordHash,
      role: role || 'user',
      createdBy: payload.username,
    });

    return NextResponse.json({
      message: 'Usuario creado exitosamente',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Admin user creation error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
