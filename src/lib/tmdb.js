const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || '';

const fetchFromTMDB = async (endpoint, params = {}) => {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }
  return response.json();
};

export const tmdbApi = {
  getMovie: async (id) => {
    const data = await fetchFromTMDB(`/movie/${id}`, { append_to_response: 'credits,images,videos' });
    return data;
  },

  getPopularMovies: async (page = 1, language = 'ta-IN') => {
    return fetchFromTMDB('/movie/popular', { page, language, region: 'IN' });
  },

  getTrendingMovies: async (timeWindow = 'week') => {
    return fetchFromTMDB(`/trending/movie/${timeWindow}`);
  },

  searchMovies: async (query, page = 1) => {
    return fetchFromTMDB('/search/movie', { query, page, include_adult: false });
  },

  discoverMovies: async (params = {}) => {
    return fetchFromTMDB('/discover/movie', {
      include_adult: false,
      sort_by: 'popularity.desc',
      ...params,
    });
  },

  getPerson: async (id) => {
    const data = await fetchFromTMDB(`/person/${id}`, { 
      append_to_response: 'movie_credits,external_ids' 
    });
    return data;
  },

  searchPeople: async (query, page = 1) => {
    return fetchFromTMDB('/search/person', { query, page });
  },

  getPopularPeople: async (page = 1) => {
    return fetchFromTMDB('/person/popular', { page });
  },

  getMovieCredits: async (movieId) => {
    return fetchFromTMDB(`/movie/${movieId}/credits`);
  },

  getPersonMovieCredits: async (personId) => {
    return fetchFromTMDB(`/person/${personId}/movie_credits`);
  },

  getGenreList: async (language = 'en') => {
    return fetchFromTMDB('/genre/movie/list', { language });
  },

  getNowPlaying: async (region = 'IN', page = 1) => {
    return fetchFromTMDB('/movie/now_playing', { region, page });
  },

  getTopRated: async (region = 'IN', page = 1) => {
    return fetchFromTMDB('/movie/top_rated', { region, page });
  },

  getUpcoming: async (region = 'IN', page = 1) => {
    return fetchFromTMDB('/movie/upcoming', { region, page });
  },
};

export const LANGUAGES = {
  ta: { name: 'Tamil', region: 'IN' },
  te: { name: 'Telugu', region: 'IN' },
  ml: { name: 'Malayalam', region: 'IN' },
  hi: { name: 'Hindi', region: 'IN' },
  kn: { name: 'Kannada', region: 'IN' },
  bn: { name: 'Bengali', region: 'IN' },
  mr: { name: 'Marathi', region: 'IN' },
};

export const getMoviesByLanguage = async (language, page = 1) => {
  const langCode = LANGUAGES[language]?.name.toLowerCase() || language;
  return tmdbApi.discoverMovies({
    with_original_language: language,
    region: 'IN',
    page,
  });
};
