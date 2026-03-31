import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import { FavoriteList } from '@/models/FavoriteList';
import { decrypt } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { slug, title, cover } = await req.json();

    if (!slug || !title || !cover) {
      return NextResponse.json({ error: 'Información de anime incompleta' }, { status: 400 });
    }

    const sessionCookie = req.cookies.get('session');
    if (!sessionCookie) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const payload = await decrypt(sessionCookie.value);
    if (!payload) return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });

    await connectDB();

    const list = await FavoriteList.findOne({ _id: id, userId: payload.userId });
    if (!list) {
      return NextResponse.json({ error: 'Lista no encontrada o no autorizada' }, { status: 404 });
    }

    // Check for duplicates
    const alreadyExists = list.animes.some((a) => a.slug === slug);
    if (alreadyExists) {
      return NextResponse.json({ error: 'El anime ya está en esta lista' }, { status: 400 });
    }

    // Add to list
    list.animes.push({
      slug,
      title,
      cover,
      addedAt: new Date(),
    });

    await list.save();

    return NextResponse.json({ message: 'Anime añadido a la lista', list }, { status: 200 });

  } catch (error) {
    console.error('Add anime to list error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
