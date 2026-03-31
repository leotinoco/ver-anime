import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import { FavoriteList } from '@/models/FavoriteList';
import { decrypt } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('session');
    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const payload = await decrypt(sessionCookie.value);
    if (!payload) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    await connectDB();
    const lists = await FavoriteList.find({ userId: payload.userId }).sort({ updatedAt: -1 });

    return NextResponse.json({ authenticated: true, lists }, { status: 200 });

  } catch (error) {
    console.error('Fetch lists error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }

    const sessionCookie = req.cookies.get('session');
    if (!sessionCookie) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const payload = await decrypt(sessionCookie.value);
    if (!payload) return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });

    await connectDB();

    // Check if user already has 3 lists
    const count = await FavoriteList.countDocuments({ userId: payload.userId });
    if (count >= 3) {
      return NextResponse.json({ error: 'Máximo 3 listas permitidas (Límite alcanzado)' }, { status: 400 });
    }

    const newList = await FavoriteList.create({
      userId: payload.userId,
      name: name.trim(),
      animes: [],
    });

    return NextResponse.json({ message: 'Lista creada', list: newList }, { status: 201 });

  } catch (error) {
    console.error('Create list error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
