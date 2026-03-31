import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { decrypt } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import { FavoriteList } from '@/models/FavoriteList';
import { Plus, ListVideo, GripVertical, Trash2 } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Mi Lista - Anime Fan',
};

export default async function FavoritosPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  
  if (!sessionCookie) {
    redirect('/login');
  }

  const payload = await decrypt(sessionCookie.value);
  if (!payload) {
    redirect('/login');
  }

  // Fetch real data from MongoDB
  await connectDB();
  // Using lean() to get plain JS objects instead of Mongoose documents for the template
  // @ts-ignore
  const userLists: any[] = await FavoriteList.find({ userId: payload.userId }).lean();

  return (
    <div className="min-h-screen bg-[#141414] text-white pt-24 pb-12">
      <div className="container mx-auto px-4 md:px-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-black mb-2 flex items-center gap-3">
              <ListVideo className="w-8 h-8 text-primary" /> Mis Listas
            </h1>
            <p className="text-gray-400">
              Organiza tus animes favoritos. Puedes crear hasta 3 listas personalizadas.
            </p>
          </div>
          
          <button className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded text-sm font-bold hover:bg-neutral-300 transition-colors shrink-0">
            <Plus className="w-4 h-4" /> Crear Nueva Lista
          </button>
        </div>

        {userLists && userLists.length > 0 ? (
          <div className="space-y-12">
            {userLists.map((list) => (
              <div key={list._id.toString()} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-4 mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    {list.name}
                    <span className="text-sm font-normal text-gray-400 bg-zinc-800 px-2 py-0.5 rounded-full">
                      {list.animes.length} animes
                    </span>
                  </h2>
                  <button aria-label="Delete List" title="Delete List" className="text-gray-500 hover:text-red-500 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {list.animes.map((anime: any) => (
                    <div key={anime.slug} className="group relative w-full aspect-[2/3] rounded-md overflow-hidden bg-zinc-800 border border-zinc-700">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={anime.cover} 
                        alt={anime.title} 
                        className="w-full h-full object-cover"
                      />
                      
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-4">
                        <Link href={`/anime/${anime.slug}`} className="bg-primary hover:bg-red-700 text-white p-2 rounded-full mb-2">
                           <ListVideo className="w-5 h-5" />
                        </Link>
                        <p className="text-xs font-semibold text-center mt-2 line-clamp-2">{anime.title}</p>
                      </div>
                      
                      <div className="absolute top-2 left-2 bg-black/50 p-1 rounded backdrop-blur-sm opacity-0 group-hover:opacity-100 cursor-grab">
                        <GripVertical className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  ))}
                  
                  {list.animes.length === 0 && (
                    <div className="col-span-full py-10 text-center text-gray-500 italic text-sm">
                      Esta lista está vacía. Agrega animes desde el buscador o la página principal.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-zinc-800 rounded-xl bg-zinc-900/50">
            <ListVideo className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h2 className="text-2xl font-bold mb-2">No tienes listas creadas</h2>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              Comienza a guardar tus animes favoritos para tenerlos siempre organizados.
            </p>
            <button className="flex items-center gap-2 bg-primary text-white mx-auto px-6 py-2.5 rounded text-sm font-bold hover:bg-red-700 transition-colors">
              <Plus className="w-4 h-4" /> Crear mi primera lista
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
