/**
 * Server-side service to fetch directly from AnimeFLV API.
 * This should ONLY be used in Next.js Server Components.
 * For client components, use the `/api/proxy` endpoints.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://animeflv.ahmedrangel.com/api';

// Helper to handle the fetch and errors
async function fetchApi<T>(endpoint: string, tags: string[] = [], revalidate = 3600): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      next: { tags, revalidate },
      headers: { 'Accept': 'application/json' },
    });
    
    if (!res.ok) {
      console.error(`API Error on ${endpoint}:`, res.statusText);
      return null;
    }
    
    // The AnimeFLV unofficial API wraps responses in { success: true, data: T }
    const payload = await res.json();
    if (payload && payload.success) {
      return payload.data as T;
    }
    return null;
  } catch (error) {
    console.error(`[AnimeService] Fetch error for ${endpoint}:`, error);
    return null;
  }
}

// Interfaces matches standard endpoints provided by unnoficial API
export interface AnimeOnAir {
  slug: string;
  title: string;
  cover: string;
  type: string;
  year: number;
}

export interface LatestEpisode {
  id: string; // The episode slug
  number: number;
  anime: {
    title: string;
    slug: string;
    cover: string;
  }
}

// 1. Get On Air Animes
export async function getAnimesOnAir() {
  return fetchApi<AnimeOnAir[]>('/list/animes-on-air');
}

// 2. Get Latest Episodes
export async function getLatestEpisodes() {
  return fetchApi<LatestEpisode[]>('/list/latest-episodes');
}

// 3. Get Anime Details by Slug
export async function getAnimeDetails(slug: string) {
  return fetchApi<any>(`/anime/${slug}`, [`anime-${slug}`], 86400); // 1 day cache for details
}

// 4. Get Episode details (Servers) by slug (which usually includes anime and number)
export async function getEpisodeDetails(slug: string) {
  return fetchApi<any>(`/anime/episode/${slug}`, [`episode-${slug}`]);
}

// 4.5. Get Episode by Anime Slug and Number
export async function getEpisodeByNumber(slug: string, number: string | number) {
  return fetchApi<any>(`/anime/${slug}/episode/${number}`, [`episode-${slug}-${number}`]);
}

// 5. Search
export async function searchAnime(query: string, page = 1) {
  return fetchApi<any>(`/search?query=${encodeURIComponent(query)}&page=${page}`, [], 300); // 5 min cache
}

// 6. Jikan (MyAnimeList) API integration
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

export async function getTopAnimeJikan(): Promise<JikanAnime[]> {
  try {
    const res = await fetch('https://api.jikan.moe/v4/top/anime', {
      next: { revalidate: 86400 } // 1 day cache
    });
    const { data } = await res.json();
    return data || [];
  } catch (error) {
    console.error('[JikanService] Error fetching top anime:', error);
    return [];
  }
}

// 7. Title to Slug Mapping (Heuristics)
export async function findSlugByTitle(title: string): Promise<string | null> {
  // We search in AnimeFLV using the title and pick the first match that closely resembles the title
  const results = await searchAnime(title);
  if (results && results.length > 0) {
    // Basic heuristic: check if the first result title starts with the search title
    const firstMatch = results[0];
    const cleanSearch = title.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanMatch = firstMatch.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (cleanMatch.includes(cleanSearch) || cleanSearch.includes(cleanMatch)) {
      return firstMatch.slug;
    }
  }
  return null;
}
