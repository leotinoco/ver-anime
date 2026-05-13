const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://animeflv.ahmedrangel.com/api';

const DETAILS_REVALIDATE_S = 86400;
const SEARCH_REVALIDATE_S = 300;
const DEFAULT_REVALIDATE_S = 3600;

const fetchApi = async <T>(endpoint: string, tags: string[] = [], revalidate = DEFAULT_REVALIDATE_S): Promise<T | null> => {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      next: { tags, revalidate },
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      console.error(`API Error on ${endpoint}:`, res.statusText);
      return null;
    }

    const payload = await res.json();
    if (payload && payload.success) {
      return payload.data;
    }
    return null;
  } catch (error) {
    console.error(`[AnimeService] Fetch error for ${endpoint}:`, error);
    return null;
  }
};

interface AnimeOnAir {
  slug: string;
  title: string;
  cover: string;
  type: string;
  year: number;
}

interface LatestEpisode {
  id: string;
  number: number;
  anime: {
    title: string;
    slug: string;
    cover: string;
  }
}


export interface JikanAnime {
  mal_id: number;
  url: string;
  images: { jpg: { large_image_url: string } };
  title: string;
  title_english: string;
  type: string;
  score: number;
  year: number;
}

export const getAnimesOnAir = () => fetchApi<AnimeOnAir[]>('/list/animes-on-air');

export const getLatestEpisodes = () => fetchApi<LatestEpisode[]>('/list/latest-episodes');

export const getAnimeDetails = (slug: string) =>
  fetchApi<Record<string, any>>(`/anime/${slug}`, [`anime-${slug}`], DETAILS_REVALIDATE_S);

export const getEpisodeByNumber = (slug: string, number: string | number) =>
  fetchApi<Record<string, any>>(`/anime/${slug}/episode/${number}`, [`episode-${slug}-${number}`]);

export const searchAnime = (query: string, page = 1) =>
  fetchApi<Record<string, any>>(`/search?query=${encodeURIComponent(query)}&page=${page}`, [], SEARCH_REVALIDATE_S);

export const getTopAnimeJikan = async (): Promise<JikanAnime[]> => {
  try {
    const res = await fetch('https://api.jikan.moe/v4/top/anime', {
      next: { revalidate: DETAILS_REVALIDATE_S }
    });
    const { data } = await res.json();
    return data || [];
  } catch (error) {
    console.error('[JikanService] Error fetching top anime:', error);
    return [];
  }
};

export const findSlugByTitle = async (title: string): Promise<string | null> => {
  const results = await searchAnime(title);
  if (results && Array.isArray(results) && results.length > 0) {
    const firstMatch = results[0];
    const cleanSearch = title.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanMatch = firstMatch.title.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (cleanMatch.includes(cleanSearch) || cleanSearch.includes(cleanMatch)) {
      return firstMatch.slug;
    }
  }
  return null;
};
