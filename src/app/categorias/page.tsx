import { LayoutGrid, AlertCircle } from 'lucide-react';
import { getAnimesOnAir, getAnimeDetails } from '@/services/animeApi';
import AnimeCard from '@/components/ui/AnimeCard';

export const metadata = {
  title: 'Categorías - Anime Fan',
};

// Revalidate once a day to keep it fast
export const revalidate = 86400;

export default async function CategoriasPage() {
  // Same logic: Due to the API's lack of a "/genres" endpoint, we capture the trends 
  // and dynamically build clusters based on their individual 'genres' arrays.
  const baseList = await getAnimesOnAir();
  const rawAnimes = baseList ? baseList.slice(0, 30) : [];
  
  const enrichedAnimes = await Promise.all(
    rawAnimes.map(async (anime) => {
      try {
        const details = await getAnimeDetails(anime.slug);
        return {
          ...anime,
          cover: details?.cover || '',
          genres: details?.genres || ['Desconocido'],
        };
      } catch(e) {
        return { ...anime, cover: '', genres: ['Desconocido'] };
      }
    })
  );

  // Group anime by genres algorithmically
  const categoriesMap: Record<string, typeof enrichedAnimes> = {};
  
  enrichedAnimes.forEach((anime) => {
    anime.genres.forEach((genre: string) => {
      if (!categoriesMap[genre]) {
        categoriesMap[genre] = [];
      }
      categoriesMap[genre].push(anime);
    });
  });

  // Convert Dictionary to array of categories and sort them by the amount of Anime they hold
  const activeCategories = Object.entries(categoriesMap)
    .map(([name, animes]) => ({ name, animes }))
    .sort((a, b) => b.animes.length - a.animes.length)
    .filter(cat => cat.name !== 'Desconocido' && cat.animes.length > 0);

  return (
    <div className="min-h-screen bg-[#141414] text-white pt-24 pb-12">
      <div className="container mx-auto px-4 md:px-12">
        <div className="mb-10">
          <h1 className="text-3xl md:text-5xl font-black mb-6 flex items-center gap-3">
            <LayoutGrid className="w-10 h-10 text-primary" />
            Explorar Categorías
          </h1>
          
          <div className="mb-10">
            <p className="text-gray-300 text-sm font-bold mb-4">
              Para ver todos los animes disponibles en Anime flv por genero has clic en los siguientes botones:
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'Acción', link: 'https://www4.animeflv.net/browse?genre=accion' },
                { name: 'Artes Marciales', link: 'https://www4.animeflv.net/browse?genre=artes-marciales' },
                { name: 'Aventuras', link: 'https://www4.animeflv.net/browse?genre=aventura' },
                { name: 'Carreras', link: 'https://www4.animeflv.net/browse?genre=carreras' },
                { name: 'Ciencia Ficción', link: 'https://www4.animeflv.net/browse?genre=ciencia-ficcion' },
                { name: 'Comedia', link: 'https://www4.animeflv.net/browse?genre=comedia' },
                { name: 'Demencia', link: 'https://www4.animeflv.net/browse?genre=demencia' },
                { name: 'Demonios', link: 'https://www4.animeflv.net/browse?genre=demonios' },
                { name: 'Deportes', link: 'https://www4.animeflv.net/browse?genre=deportes' },
                { name: 'Drama', link: 'https://www4.animeflv.net/browse?genre=drama' },
                { name: 'Ecchi', link: 'https://www4.animeflv.net/browse?genre=ecchi' },
                { name: 'Escolares', link: 'https://www4.animeflv.net/browse?genre=escolares' },
                { name: 'Espacial', link: 'https://www4.animeflv.net/browse?genre=espacial' },
                { name: 'Fantasía', link: 'https://www4.animeflv.net/browse?genre=fantasia' },
                { name: 'Harem', link: 'https://www4.animeflv.net/browse?genre=harem' },
                { name: 'Historico', link: 'https://www4.animeflv.net/browse?genre=historico' },
                { name: 'Infantil', link: 'https://www4.animeflv.net/browse?genre=infantil' },
                { name: 'Josei', link: 'https://www4.animeflv.net/browse?genre=josei' },
                { name: 'Juegos', link: 'https://www4.animeflv.net/browse?genre=juegos' },
                { name: 'Magia', link: 'https://www4.animeflv.net/browse?genre=magia' },
                { name: 'Mecha', link: 'https://www4.animeflv.net/browse?genre=mecha' },
                { name: 'Militar', link: 'https://www4.animeflv.net/browse?genre=militar' },
                { name: 'Misterio', link: 'https://www4.animeflv.net/browse?genre=misterio' },
                { name: 'Música', link: 'https://www4.animeflv.net/browse?genre=musica' },
                { name: 'Parodia', link: 'https://www4.animeflv.net/browse?genre=parodia' },
                { name: 'Policía', link: 'https://www4.animeflv.net/browse?genre=policia' },
                { name: 'Psicológico', link: 'https://www4.animeflv.net/browse?genre=psicologico' },
                { name: 'Recuentos de la vida', link: 'https://www4.animeflv.net/browse?genre=recuentos-de-la-vida' },
                { name: 'Romance', link: 'https://www4.animeflv.net/browse?genre=romance' },
                { name: 'Samurai', link: 'https://www4.animeflv.net/browse?genre=samurai' },
                { name: 'Seinen', link: 'https://www4.animeflv.net/browse?genre=seinen' },
                { name: 'Shoujo', link: 'https://www4.animeflv.net/browse?genre=shoujo' },
                { name: 'Shounen', link: 'https://www4.animeflv.net/browse?genre=shounen' },
                { name: 'Sobrenatural', link: 'https://www4.animeflv.net/browse?genre=sobrenatural' },
                { name: 'Superpoderes', link: 'https://www4.animeflv.net/browse?genre=superpoderes' },
                { name: 'Suspenso', link: 'https://www4.animeflv.net/browse?genre=suspenso' },
                { name: 'Terror', link: 'https://www4.animeflv.net/browse?genre=terror' },
                { name: 'Vampiros', link: 'https://www4.animeflv.net/browse?genre=vampiros' },
                { name: 'Yaoi', link: 'https://www4.animeflv.net/browse?genre=yaoi' },
                { name: 'Yuri', link: 'https://www4.animeflv.net/browse?genre=yuri' }
              ].sort((a, b) => a.name.localeCompare(b.name)).map((genre) => (
                <a
                  key={genre.name}
                  href={genre.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-md text-[11px] font-bold text-gray-400 hover:bg-primary hover:border-primary hover:text-white transition-all whitespace-nowrap"
                >
                  {genre.name}
                </a>
              ))}
            </div>
          </div>

          <p className="text-gray-400 text-lg max-w-2xl mb-4 pt-6 border-t border-zinc-800/50">
            Debido a restricciones de infraestructura, hemos recolectado inteligentemente los géneros que están predominando esta temporada en nuestra plataforma:
          </p>
        </div>

        {activeCategories.length > 0 ? (
          <div className="space-y-16">
            {activeCategories.map((category) => (
              <section key={category.name} className="space-y-4">
                <div className="flex items-center gap-3 border-b border-zinc-800 pb-2">
                  <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                    {category.name}
                  </h2>
                  <span className="bg-zinc-800 text-xs px-3 py-1 rounded-full font-mono text-gray-300">
                    {category.animes.length} animes
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                  {category.animes.map((anime) => (
                    <AnimeCard 
                      key={`${category.name}-${anime.slug}`}
                      slug={anime.slug}
                      title={anime.title}
                      cover={anime.cover}
                      type={anime.type}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 flex flex-col items-center">
             <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
             <h2 className="text-2xl font-bold">Error en la Extracción</h2>
             <p className="text-zinc-400 max-w-md mt-2">
               No pudimos categorizar correctamente el catálogo de esta temporada. Intenta refrescando más tarde.
             </p>
          </div>
        )}
      </div>
    </div>
  );
}
