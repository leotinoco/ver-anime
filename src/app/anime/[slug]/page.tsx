import Image from 'next/image';
import Link from 'next/link';
import { Play, ChevronLeft, Calendar, Tag, Star } from 'lucide-react';
import { getAnimeDetails } from '@/services/animeApi';
import { notFound } from 'next/navigation';
import AddToListButton from '@/components/ui/AddToListButton';

export const revalidate = 3600; // 1 hr cache

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const anime = await getAnimeDetails(resolvedParams.slug);

  if (!anime) {
    return { title: 'Anime no encontrado' };
  }

  return {
    title: `${anime.title} - Anime Fan`,
    description: anime.synopsis,
  };
}

export default async function AnimeDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const anime = await getAnimeDetails(resolvedParams.slug);

  if (!anime || !anime.title) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      {/* Banner / Hero section for Anime Detail */}
      <div className="relative w-full h-[50vh] md:h-[60vh]">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={anime.cover}
            alt={anime.title}
            className="w-full h-full object-cover md:object-[center_20%] opacity-40 blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-black/50 to-transparent" />
        </div>

        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 md:px-12 pb-12">
            <Link href="/" className="inline-flex items-center text-gray-300 hover:text-white mb-6">
              <ChevronLeft className="w-5 h-5 mr-1" /> Volver al Inicio
            </Link>
            
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-end">
              {/* Cover Image */}
              <div className="w-48 md:w-64 rounded-xl overflow-hidden shadow-2xl shrink-0 hidden md:block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={anime.cover} 
                  alt={anime.title} 
                  className="w-full h-auto object-cover"
                />
              </div>

              <div className="flex-1 max-w-4xl">
                <h1 className="text-4xl md:text-5xl font-black mb-4 drop-shadow-md">
                  {anime.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-sm font-semibold mb-6">
                  {anime.rating && (
                    <span className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-4 h-4 fill-current" /> {anime.rating}
                    </span>
                  )}
                  <span className="text-green-500">
                    {['1', 'En emision', 'En emisión'].includes(anime.status) ? 'En Emisión' : 'Finalizado'}
                  </span>
                  {anime.type && <span className="border border-gray-600 px-2 rounded-sm">{anime.type.toUpperCase()}</span>}
                </div>

                <div className="flex items-center gap-4 mb-8">
                  {anime.episodes && anime.episodes.length > 0 ? (
                    <Link
                      href={`/ver/${resolvedParams.slug}/${anime.episodes[anime.episodes.length - 1].number}`}
                      className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded text-lg font-bold hover:bg-white/80 transition-colors"
                    >
                      <Play className="w-6 h-6 fill-black" /> 
                      Ver Ep. {anime.episodes[anime.episodes.length - 1].number}
                    </Link>
                  ) : (
                   <button disabled className="bg-gray-600 text-white px-8 py-3 rounded text-lg font-bold opacity-50 cursor-not-allowed">
                     Sin episodios
                   </button>
                  )}
                  
                  <AddToListButton 
                    slug={resolvedParams.slug}
                    title={anime.title}
                    cover={anime.cover}
                    variant="full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details and Episodes Below Fold */}
      <div className="container mx-auto px-4 md:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-3 text-gray-200">Sinopsis</h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                {anime.synopsis}
              </p>
            </div>

            <div className="pt-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                Episodios ({anime.episodes?.length || 0})
              </h3>
              
              <div className="grid gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {anime.episodes?.map((ep: any) => (
                  <Link 
                    key={ep.number} 
                    href={`/ver/${resolvedParams.slug}/${ep.number}`}
                    className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg bg-zinc-900/50 hover:bg-zinc-800 transition-colors border border-zinc-800/50 group"
                  >
                    <div className="relative w-full sm:w-48 aspect-video bg-zinc-800 rounded overflow-hidden shrink-0 flex items-center justify-center">
                      <Play className="w-8 h-8 text-white opacity-50 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg mb-1 group-hover:text-white text-gray-200 transition-colors">
                        Episodio {ep.number}
                      </h4>
                      <p className="text-sm text-gray-400 line-clamp-2">
                        Haz clic para ver el episodio {ep.number} de {anime.title}.
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
              <h3 className="text-lg font-bold mb-4">Detalles</h3>
              
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-gray-500 block mb-1">Títulos Alternativos</span>
                  <p className="text-gray-300">
                    {anime.alternative_titles?.length > 0 
                       ? anime.alternative_titles.join(', ') 
                       : 'N/A'
                    }
                  </p>
                </div>
                
                <div>
                  <span className="text-gray-500 block mb-1">Géneros</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {anime.genres?.map((genre: string) => (
                      <span key={genre} className="bg-zinc-800 text-gray-300 px-3 py-1 rounded-full text-xs hover:bg-zinc-700 cursor-pointer transition-colors">
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>

                {anime.next_airing_episode && (
                  <div>
                    <span className="text-gray-500 block mb-1">Próximo Episodio</span>
                    <p className="text-primary font-bold">
                       Episodio {anime.next_airing_episode}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
