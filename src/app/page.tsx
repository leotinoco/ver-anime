import { getAnimesOnAir, getLatestEpisodes, getAnimeDetails } from '@/services/animeApi';
import HeroCarousel from '@/components/ui/HeroCarousel';
import Carousel from '@/components/ui/Carousel';

export const revalidate = 3600; // revalidate every hour for ISR

export default async function Home() {
  const [baseOnAir, latestEpisodes] = await Promise.all([
    getAnimesOnAir(),
    getLatestEpisodes()
  ]);

  // Featured items for the Hero Carousel
  const featuredSlugs = [
    'hotaru-no-haka',
    'sen-to-chihiro-no-kamikakushi',
    'cowboy-bebop',
    'monster'
  ];

  const featuredItems = await Promise.all(
    featuredSlugs.map(async (slug) => {
      try {
        const details = await getAnimeDetails(slug);
        if (!details) return null;
        return {
          slug,
          title: details.title,
          cover: details.cover,
          synopsis: details.synopsis,
          type: details.type,
          year: details.year
        };
      } catch (e) {
        return null;
      }
    })
  ).then(items => items.filter(item => item !== null));

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
      <HeroCarousel items={featuredItems as any[]} />
      
      <div className="relative z-20 -mt-[10%] md:-mt-[5%] space-y-8">
        {onAir && onAir.length > 0 && (
          <Carousel 
            title="En Emisión y Tendencias" 
            items={onAir} 
          />
        )}
        
        {latestEpisodes && latestEpisodes.length > 0 && (
          <Carousel 
            title="Últimos Episodios" 
            items={latestEpisodes} 
            isEpisode={true}
          />
        )}
      </div>
    </div>
  );
}
