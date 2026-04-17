export const INDUSTRY_SLUGS = {
  tamil: { name: 'Tamil', code: 'ta', flag: '🇮🇳' },
  telugu: { name: 'Telugu', code: 'te', flag: '🇮🇳' },
  malayalam: { name: 'Malayalam', code: 'ml', flag: '🇮🇳' },
  hindi: { name: 'Hindi', code: 'hi', flag: '🇮🇳' },
  kannada: { name: 'Kannada', code: 'kn', flag: '🇮🇳' },
  bengali: { name: 'Bengali', code: 'bn', flag: '🇮🇳' },
  marathi: { name: 'Marathi', code: 'mr', flag: '🇮🇳' },
};

export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
export const TMDB_POSTER_SIZES = {
  small: 'w185',
  medium: 'w342',
  large: 'w500',
  original: 'original',
};
export const TMDB_BACKDROP_SIZES = {
  small: 'w300',
  medium: 'w780',
  large: 'w1280',
  original: 'original',
};
export const TMDB_PROFILE_SIZES = {
  small: 'w45',
  medium: 'w185',
  large: 'h632',
  original: 'original',
};

export const getPosterUrl = (path, size = 'medium') => {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE_URL}/${TMDB_POSTER_SIZES[size]}${path}`;
};

export const getBackdropUrl = (path, size = 'large') => {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE_URL}/${TMDB_BACKDROP_SIZES[size]}${path}`;
};

export const getProfileUrl = (path, size = 'medium') => {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE_URL}/${TMDB_PROFILE_SIZES[size]}${path}`;
};
