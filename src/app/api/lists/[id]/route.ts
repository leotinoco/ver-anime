import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import { FavoriteList } from '@/models/FavoriteList';
import { decrypt } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name } = await req.json();

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }

    const sessionCookie = req.cookies.get('session');
    if (!sessionCookie) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const payload = await decrypt(sessionCookie.value);
    if (!payload) return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });

    await connectDB();

    // Verify ownership
    const list = await FavoriteList.findOne({ _id: id, userId: payload.userId });
    if (!list) {
      return NextResponse.json({ error: 'Lista no encontrada o no tienes permisos' }, { status: 404 });
    }

    list.name = name;
    await list.save();

    return NextResponse.json({ message: 'Lista actualizada', name: list.name }, { status: 200 });

  } catch (error) {
    console.error('Update list error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
