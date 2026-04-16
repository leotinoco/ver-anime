import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import { FavoriteList } from '@/models/FavoriteList';
import { decrypt } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { animeSlug, sourceListId, targetListId, newIndex } = await req.json();

    if (!animeSlug || !sourceListId || !targetListId) {
      return NextResponse.json({ error: 'Faltan parámetros obligatorios' }, { status: 400 });
    }

    const sessionCookie = req.cookies.get('session');
    if (!sessionCookie) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const payload = await decrypt(sessionCookie.value);
    if (!payload) return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });

    await connectDB();

    // 1. Fetch both lists to ensure they belong to the user
    const lists = await FavoriteList.find({
      _id: { $in: [sourceListId, targetListId] },
      userId: payload.userId
    });

    if (lists.length === 0) {
      return NextResponse.json({ error: 'Listas no encontradas' }, { status: 404 });
    }

    const sourceList = lists.find(l => l._id.toString() === sourceListId);
    const targetList = lists.find(l => l._id.toString() === targetListId);

    if (!sourceList || !targetList) {
      return NextResponse.json({ error: 'Listas no encontradas' }, { status: 404 });
    }

    // 2. Find the anime in the source list
    const animeIndex = sourceList.animes.findIndex(a => a.slug === animeSlug);
    if (animeIndex === -1) {
      return NextResponse.json({ error: 'Anime no encontrado en la lista de origen' }, { status: 404 });
    }

    const [anime] = sourceList.animes.splice(animeIndex, 1);

    // 3. Add the anime to the target list
    if (sourceListId === targetListId) {
      // Reordering within the same list
      sourceList.animes.splice(newIndex ?? sourceList.animes.length, 0, anime);
      await sourceList.save();
    } else {
      // Moving between lists
      targetList.animes.splice(newIndex ?? targetList.animes.length, 0, anime);
      
      // Save both
      await sourceList.save();
      await targetList.save();
    }

    return NextResponse.json({ message: 'Anime movido correctamente' }, { status: 200 });

  } catch (error) {
    console.error('Move anime error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
