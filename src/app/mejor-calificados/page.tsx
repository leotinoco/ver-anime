import { Star } from 'lucide-react';
import { getAnimesOnAir, getAnimeDetails } from '@/services/animeApi';
import AnimeCard from '@/components/ui/AnimeCard';

export const metadata = {
  title: 'Mejor Calificados - Anime Fan',
};

// Revalidate this page once a day to ensure ratings stay fresh
export const revalidate = 86400;

export default async function MejorCalificadosPage() {
  // Fetch current trends since AnimeFLV wrapper lacks a direct "top" endpoint.
  // We'll analyze their current ratings to establish our Top Ranking page.
  const baseList = await getAnimesOnAir();
  const rawAnimes = baseList ? baseList.slice(0, 30) : []; // Limited to 30 to avoid API rate limits
  
  // Enrich the data to get the exact rating and cover for each anime
  const enrichedAnimes = await Promise.all(
    rawAnimes.map(async (anime) => {
      try {
        const details = await getAnimeDetails(anime.slug);
        return {
          ...anime,
          cover: details?.cover || '',
          rating: details?.rating ? parseFloat(details.rating) : 0,
        };
      } catch(e) {
        return { ...anime, rating: 0 };
      }
    })
  );

  // Sort them from highest rating to lowest
  const sortedAnimes = enrichedAnimes.sort((a, b) => b.rating - a.rating);

  return (
    <div className="min-h-screen bg-[#141414] text-white pt-24 pb-12">
      <div className="container mx-auto px-4 md:px-12">
        <div className="mb-10">
          <h1 className="text-3xl md:text-5xl font-black mb-4 flex items-center gap-3">
            <Star className="w-10 h-10 text-yellow-500 fill-yellow-500" />
            Mejor Calificados
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Explora las joyas de la temporada actual. Aquí están los animes ordenados por la calificación otorgada por la comunidad mundial de fanáticos, de mejor a peor.
          </p>
        </div>

        {sortedAnimes.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {sortedAnimes.map((anime, index) => (
              <div key={anime.slug} className="relative group">
                {/* Ranking Badge overlay */}
                <div className="absolute -top-3 -left-3 w-10 h-10 bg-yellow-500 text-black font-black flex items-center justify-center rounded-full z-20 shadow-lg border-2 border-black">
                  #{index + 1}
                </div>
                
                {/* Rating visualization badge inside card */}
                <div className="absolute top-2 right-2 bg-black/80 backdrop-blur px-2 py-1 rounded text-xs font-bold text-yellow-500 z-20 flex items-center gap-1 border border-yellow-500/50">
                  <Star className="w-3 h-3 fill-yellow-500" /> {anime.rating.toFixed(1)}
                </div>

                <AnimeCard 
                  slug={anime.slug}
                  title={anime.title}
                  cover={anime.cover}
                  type={anime.type}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            Cargando la cima del mundo anime...
          </div>
        )}
      </div>
    </div>
  );
}
