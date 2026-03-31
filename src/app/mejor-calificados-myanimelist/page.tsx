import { getTopAnimeJikan, findSlugByTitle, JikanAnime } from '@/services/animeApi';
import JikanAnimeCard from '@/components/ui/JikanAnimeCard';
import { Star } from 'lucide-react';

export const revalidate = 86400; // 1 day

export default async function TopMyAnimeListPage() {
  const topJikan = await getTopAnimeJikan();
  
  const displayLimit = 24;
  const topAnimes = topJikan.slice(0, displayLimit);

  // Mapping Jikan to Local Slugs (in parallel)
  const mappedAnimes = await Promise.all(
    topAnimes.map(async (jikan: JikanAnime) => {
      const localSlug = await findSlugByTitle(jikan.title_english || jikan.title);
      return {
        ...jikan,
        localSlug: localSlug || null
      };
    })
  );

  return (
    <div className="min-h-screen bg-[#141414] text-white pt-24 pb-12 px-4 md:px-12">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-5xl font-black mb-4 flex items-center justify-center md:justify-start gap-3">
          <Star className="text-yellow-400 fill-yellow-400 w-8 h-8 md:w-10 md:h-10" />
          Mejor Calificados <span className="text-primary">MyAnimeList</span>
        </h1>
        <p className="text-gray-400 max-w-2xl text-sm md:text-base">
          Cortesía de Jikan API. Estos son los animes mejor valorados por la comunidad global de MyAnimeList. 
          Hemos intentado vincularlos con nuestro catálogo local para que puedas verlos de inmediato.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-y-10 gap-x-4">
        {mappedAnimes.map((anime, index) => (
          <div key={anime.mal_id} className="relative">
            <div className="absolute -top-3 -left-3 z-30 w-8 h-8 bg-primary rounded-full flex items-center justify-center font-bold shadow-xl border-2 border-[#141414]">
              {index + 1}
            </div>
            <JikanAnimeCard
              slug={anime.localSlug}
              title={anime.title}
              cover={anime.images.jpg.large_image_url}
              type={anime.type}
            />
            <div className="mt-2 flex items-center justify-between px-1">
               <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{anime.type}</span>
               <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold">
                  <Star size={10} className="fill-current" />
                  {anime.score}
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
