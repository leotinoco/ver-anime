import { getAnimesOnAir, getLatestEpisodes, getAnimeDetails } from '@/services/animeApi';
import Carousel from '@/components/ui/Carousel';
import BraveBanner from '@/components/ui/BraveBanner';
import RecommendedCarousel from '@/components/ui/RecommendedCarousel';

export const revalidate = 3600; // revalidate every hour for ISR

export default async function Home() {
  const [baseOnAir, latestEpisodes] = await Promise.all([
    getAnimesOnAir(),
    getLatestEpisodes()
  ]);

  // The AnimeOnAir endpoint from the unofficial API does NOT return covers.
  // We must enrich a slice of the trends by fetching their details.  
  const onAirSlice = baseOnAir ? baseOnAir.slice(0, 15) : [];
  
  const onAir = await Promise.all(
    onAirSlice.map(async (anime) => {
      try {
        const details = await getAnimeDetails(anime.slug);
        return {
          ...anime,
          cover: details?.cover || '',
          synopsis: details?.synopsis || ''
        };
      } catch(e) {
        return anime;
      }
    })
  );

  return (
    <div className="min-h-screen bg-[#141414] text-white pb-12">
      {/* Nuevo Hero Premium (Carrusel de 4 items con 12 animes totales) */}
      <div className="pt-8">
        <RecommendedCarousel />
      </div>
      
      <div className="space-y-8">
        {latestEpisodes && latestEpisodes.length > 0 && (
          <Carousel 
            title="Últimos Episodios" 
            items={latestEpisodes} 
            isEpisode={true}
          />
        )}

        {onAir && onAir.length > 0 && (
          <Carousel 
            title="En Emisión y Tendencias" 
            items={onAir} 
          />
        )}
      </div>
    </div>
  );
}
