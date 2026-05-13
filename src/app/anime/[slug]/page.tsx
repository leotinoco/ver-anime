import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Star, Play } from 'lucide-react';
import { getAnimeDetails } from '@/services/animeApi';
import { notFound } from 'next/navigation';
import AddToListButton from '@/components/ui/AddToListButton';
import EpisodeList from '@/components/ui/EpisodeList';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import { WatchProgress } from '@/models/WatchProgress';

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

  const userProgress: Record<number, 'pendiente' | 'viendo' | 'visto'> = {};
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    if (sessionCookie) {
      const payload = await decrypt(sessionCookie.value);
      if (payload) {
        await connectDB();
        const progressList = await WatchProgress.find({
          userId: payload.userId,
          animeSlug: resolvedParams.slug,
        }).lean();
        
        progressList.forEach((p: any) => {
          userProgress[p.episodeNumber] = p.status;
        });
      }
    }
  } catch {
    // Silently continue
  }

  let targetEpisode = null;
  if (anime.episodes && anime.episodes.length > 0) {
    const sortedEpisodes = anime.episodes.toSorted((a: any, b: any) => a.number - b.number);
    const minViendo = sortedEpisodes.find((ep: any) => userProgress[ep.number] === 'viendo');
    if (minViendo) {
      targetEpisode = minViendo;
    } else {
      const minPendiente = sortedEpisodes.find((ep: any) => !userProgress[ep.number] || userProgress[ep.number] === 'pendiente');
      targetEpisode = minPendiente ? minPendiente : sortedEpisodes[0];
    }
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      {/* Banner / Hero section for Anime Detail */}
      <div className="relative w-full h-[50vh] md:h-[60vh]">
        <div className="absolute inset-0">
          <Image 
            src={anime.cover}
            alt={anime.title}
            fill
            sizes="100vw"
            className="object-cover md:object-[center_20%] opacity-40 blur-[2px]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-black/50 to-transparent" />
        </div>

        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 md:px-12 pb-12">
            <Link href="/" className="inline-flex items-center text-zinc-300 hover:text-white mb-6">
              <ChevronLeft className="size-5 mr-1" /> Volver al Inicio
            </Link>
            
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-end">
              {/* Cover Image */}
              <div className="w-48 md:w-64 aspect-[2/3] relative rounded-xl overflow-hidden shadow-2xl shrink-0 hidden md:block">
                <Image 
                  src={anime.cover} 
                  alt={anime.title} 
                  fill
                  sizes="(max-width: 768px) 0vw, 256px"
                  className="object-cover"
                  priority
                />
              </div>

              <div className="flex-1 max-w-4xl">
                <h1 className="text-4xl md:text-5xl font-semibold mb-4 drop-shadow-md">
                  {anime.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-sm font-semibold mb-6">
                  {anime.rating && (
                    <span className="flex items-center gap-1 text-yellow-400">
                      <Star className="size-4 fill-current" /> {anime.rating}
                    </span>
                  )}
                  <span className="text-green-500">
                    {['1', 'En emision', 'En emisión'].includes(anime.status) ? 'En Emisión' : 'Finalizado'}
                  </span>
                  {anime.type && <span className="border border-zinc-600 px-2 rounded-sm">{anime.type.toUpperCase()}</span>}
                </div>

                <div className="flex items-center gap-4 mb-8">
                  {targetEpisode ? (
                    <Link
                      href={`/ver/${resolvedParams.slug}/${targetEpisode.number}`}
                      className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded text-lg font-bold hover:bg-white/80 transition-colors"
                    >
                      <Play className="size-6 fill-black" /> 
                      Ver Ep. {targetEpisode.number}
                    </Link>
                  ) : (
                   <button disabled className="bg-zinc-600 text-white px-8 py-3 rounded text-lg font-bold opacity-50 cursor-not-allowed">
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
              <h3 className="text-xl font-semibold mb-3 text-zinc-200">Sinopsis</h3>
              <p className="text-zinc-300 leading-relaxed text-lg">
                {anime.synopsis}
              </p>
            </div>

            <div className="pt-8">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                Episodios ({anime.episodes?.length || 0})
              </h3>
              <EpisodeList
                episodes={anime.episodes || []}
                animeSlug={resolvedParams.slug}
                animeTitle={anime.title}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
              <h3 className="text-lg font-semibold mb-4">Detalles</h3>
              
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-zinc-500 block mb-1">Títulos Alternativos</span>
                  <p className="text-zinc-300">
                    {anime.alternative_titles?.length > 0 
                       ? anime.alternative_titles.join(', ') 
                       : 'N/A'
                    }
                  </p>
                </div>
                
                <div>
                  <span className="text-zinc-500 block mb-1">Géneros</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {anime.genres?.map((genre: string) => (
                      <span key={genre} className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-xs hover:bg-zinc-700 cursor-pointer transition-colors">
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>

                {anime.next_airing_episode && (
                  <div>
                    <span className="text-zinc-500 block mb-1">Próximo Episodio</span>
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
