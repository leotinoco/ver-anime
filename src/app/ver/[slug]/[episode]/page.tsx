import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { cookies } from 'next/headers';
import { getEpisodeByNumber, getAnimeDetails } from '@/services/animeApi';
import VideoPlayer from '@/components/ui/VideoPlayer';
import EpisodeWatcher from '@/components/ui/EpisodeWatcher';
import { decrypt } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import { WatchProgress } from '@/models/WatchProgress';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string; episode: string }> }) {
  const resolvedParams = await params;
  return {
    title: `Ver Episodio ${resolvedParams.episode} - Anime Fan`,
  };
}

export default async function WatchPage({ params }: { params: Promise<{ slug: string; episode: string }> }) {
  const resolvedParams = await params;
  const { slug, episode } = resolvedParams;

  // Parallel fetch: get episode servers AND anime info for title context
  const [episodeData, animeData] = await Promise.all([
    getEpisodeByNumber(slug, episode),
    getAnimeDetails(slug)
  ]);

  if (!episodeData || !episodeData.servers) {
    notFound();
  }

  const title = episodeData.title || (animeData?.title ? `${animeData.title} - Episodio ${episode}` : `Episodio ${episode}`);

  const parsedEpisode = parseInt(episode);
  const maxEpisode = animeData?.episodes && animeData.episodes.length > 0
    ? Math.max(...animeData.episodes.map((e: any) => e.number))
    : parsedEpisode;
  const isLastAvailableEpisode = parsedEpisode >= maxEpisode;

  // Get user session and episode status
  let initialStatus: 'pendiente' | 'viendo' | 'visto' = 'pendiente';
  let isAuthenticated = false;

  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    if (sessionCookie) {
      const payload = await decrypt(sessionCookie.value);
      if (payload) {
        isAuthenticated = true;
        await connectDB();
        const existingProgress = await WatchProgress.findOne({
          userId: payload.userId,
          animeSlug: slug,
          episodeNumber: Number(episode),
        }).lean();
        if (existingProgress) {
          initialStatus = (existingProgress as any).status || 'pendiente';
        }
      }
    }
  } catch (e) {
    // Not authenticated - silently skip
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12">
      <div className="container mx-auto px-4 md:px-12">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link 
            href={`/anime/${slug}`} 
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span className="font-semibold">{animeData?.title || 'Volver al Anime'}</span>
          </Link>
          
          <h1 className="text-2xl md:text-4xl font-black mt-4 drop-shadow-md">
            {animeData?.title ? `${animeData.title} - Episodio ${episode}` : `Episodio ${episode}`}
          </h1>
          {episodeData.title && !episodeData.title.toLowerCase().includes(`episodio ${episode}`) && (
            <h2 className="text-xl text-zinc-400 mt-2 font-semibold">
              {episodeData.title}
            </h2>
          )}
        </div>

        {/* Video Player */}
        <VideoPlayer servers={episodeData.servers} />

        {/* Episode Status Watcher (only for authenticated users) */}
        {isAuthenticated && (
          <EpisodeWatcher
            animeSlug={slug}
            episodeNumber={Number(episode)}
            initialStatus={initialStatus}
          />
        )}
        
        {/* Next/Prev Navigation */}
        <div className="mt-8 flex justify-between items-center max-w-5xl mx-auto border-t border-zinc-800 pt-6">
          <div className="flex-1">
            <Link 
              href={parsedEpisode > 1 ? `/ver/${slug}/${parsedEpisode - 1}` : '#'}
              className={`inline-block font-semibold ${parsedEpisode > 1 ? 'text-gray-300 hover:text-white' : 'text-gray-700 cursor-not-allowed pointer-events-none'}`}
            >
              &laquo; Episodio Anterior
            </Link>
          </div>

          <div className="flex-shrink-0">
            <Link 
              href={`/anime/${slug}`}
              className="px-6 py-2 bg-zinc-800 rounded-full text-sm font-semibold hover:bg-zinc-700 transition"
            >
              Lista de Episodios
            </Link>
          </div>

          <div className="flex-1 text-right">
            {!isLastAvailableEpisode ? (
              <Link 
                href={`/ver/${slug}/${parsedEpisode + 1}`}
                className="inline-block font-semibold text-gray-300 hover:text-white transition-colors"
              >
                 Siguiente Episodio &raquo;
              </Link>
            ) : (
              animeData?.status === 'En emision' && animeData?.next_airing_episode ? (
                <span className="inline-block text-sm font-medium text-zinc-400 bg-zinc-900 px-4 py-2 border border-zinc-800 rounded-full">
                  Próximo ep: {animeData.next_airing_episode}
                </span>
              ) : null
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
