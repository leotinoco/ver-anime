import { searchAnime } from '@/services/animeApi';
import AnimeCard from '@/components/ui/AnimeCard';
import { Search, Frown } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

export const revalidate = 300; // 5 mins cache for search queries

export const metadata = {
  title: 'Buscar Anime - Anime Fan',
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || '';
  const page = parseInt(params.page || '1', 10);
  
  let results: any[] = [];
  
  if (query) {
    const searchData = await searchAnime(query, page);
    results = searchData?.media || [];
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white pt-24 pb-12">
      <div className="container mx-auto px-4 md:px-12">
        
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black mb-2 flex items-center gap-3">
            <Search className="w-8 h-8 text-primary" />
            {query ? `Resultados para "${query}"` : 'Buscar Anime'}
          </h1>
          <p className="text-gray-400">
            Explora nuestro catálogo completo de series y películas anime.
          </p>
        </div>

        {/* Search Results Grid */}
        <Suspense fallback={<div className="text-center py-20 animate-pulse text-gray-500">Buscando...</div>}>
           {query ? (
             results.length > 0 ? (
               <div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                    {results.map((anime: any) => (
                      <AnimeCard 
                        key={anime.slug}
                        slug={anime.slug}
                        title={anime.title}
                        cover={anime.cover}
                        type={anime.type}
                      />
                    ))}
                  </div>
                  
                  {/* Pagination logic here if AnimeFLV API returns pagination info, assuming basic next page for now */}
                  <div className="mt-12 flex justify-center gap-4">
                    {page > 1 && (
                      <Link 
                        href={`/buscar?q=${encodeURIComponent(query)}&page=${page - 1}`}
                        className="px-6 py-2 bg-zinc-800 rounded text-sm font-semibold hover:bg-zinc-700 transition"
                      >
                        Anterior
                      </Link>
                    )}
                    <Link 
                      href={`/buscar?q=${encodeURIComponent(query)}&page=${page + 1}`}
                      className="px-6 py-2 bg-zinc-800 rounded text-sm font-semibold hover:bg-zinc-700 transition"
                    >
                      Siguiente
                    </Link>
                  </div>
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center py-20 text-center">
                 <Frown className="w-16 h-16 text-gray-600 mb-4" />
                 <h2 className="text-2xl font-bold mb-2">No se encontraron resultados</h2>
                 <p className="text-gray-400 max-w-md">
                   No pudimos encontrar animes que coincidan con tu búsqueda "{query}". Intenta con otros términos.
                 </p>
               </div>
             )
           ) : (
             <div className="text-center py-20 text-gray-500 border border-zinc-800 rounded-xl bg-zinc-900/50">
               <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
               <p>Ingresa un término de búsqueda para comenzar.</p>
             </div>
           )}
        </Suspense>

      </div>
    </div>
  );
}
