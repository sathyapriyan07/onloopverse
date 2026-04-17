import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Compass, Film, Users, Sparkles } from 'lucide-react';
import { MovieCard } from '../components/movie/MovieCard';
import { tmdbApi, getMoviesByLanguage } from '../lib/tmdb';
import { SectionSkeleton, MovieCardSkeleton } from '../components/ui/Skeleton';

const INDUSTRIES = [
  { code: 'ta', name: 'Tamil', flag: '🇮🇳', description: 'Kollywood' },
  { code: 'te', name: 'Telugu', flag: '🇮🇳', description: 'Tollywood' },
  { code: 'ml', name: 'Malayalam', flag: '🇮🇳', description: 'Mollywood' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', description: 'Bollywood' },
  { code: 'kn', name: 'Kannada', flag: '🇮🇳', description: 'Sandalwood' },
  { code: 'bn', name: 'Bengali', flag: '🇮🇳', description: 'Tollywood (Bengal)' },
];

const THEMES = [
  { id: 'biopic', label: 'Biopic', icon: '👤', query: 'biography' },
  { id: 'based-on-true', label: 'Based on True Events', icon: '📚', query: 'based on true story' },
  { id: 'action', label: 'Action', icon: '💥', query: 'action' },
  { id: 'romance', label: 'Romance', icon: '💕', query: 'romance' },
  { id: 'thriller', label: 'Thriller', icon: '🔍', query: 'thriller' },
  { id: 'comedy', label: 'Comedy', icon: '😂', query: 'comedy' },
  { id: 'historical', label: 'Historical', icon: '⚔️', query: 'historical' },
  { id: 'sports', label: 'Sports', icon: '🏆', query: 'sports drama' },
];

export function Discover() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedIndustry = searchParams.get('industry') || '';
  const selectedTheme = searchParams.get('theme') || '';
  
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
        if (!API_KEY) {
          setLoading(false);
          return;
        }

        let data;
        if (selectedIndustry && selectedIndustry !== 'all') {
          data = await getMoviesByLanguage(selectedIndustry, 1);
        } else if (selectedTheme) {
          const theme = THEMES.find((t) => t.id === selectedTheme);
          if (theme) {
            data = await tmdbApi.searchMovies(theme.query, 1);
          }
        } else {
          data = await tmdbApi.getPopularMovies(1, 'ta-IN');
        }

        setMovies(data.results || []);
        setHasMore(data.total_pages > 1);
        setPage(1);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [selectedIndustry, selectedTheme]);

  const loadMore = async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    try {
      const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
      let data;
      
      if (selectedIndustry && selectedIndustry !== 'all') {
        data = await getMoviesByLanguage(selectedIndustry, page + 1);
      } else if (selectedTheme) {
        const theme = THEMES.find((t) => t.id === selectedTheme);
        if (theme) {
          data = await tmdbApi.searchMovies(theme.query, page + 1);
        }
      } else {
        data = await tmdbApi.getPopularMovies(page + 1, 'ta-IN');
      }

      setMovies((prev) => [...prev, ...(data.results || [])]);
      setPage((prev) => prev + 1);
      setHasMore(data.total_pages > page + 1);
    } catch (error) {
      console.error('Error loading more:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentIndustry = INDUSTRIES.find((i) => i.code === selectedIndustry);
  const currentTheme = THEMES.find((t) => t.id === selectedTheme);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gradient mb-2 flex items-center gap-2">
          <Compass className="w-8 h-8" />
          Discover
        </h1>
        <p className="text-cinema-text-secondary">
          Explore regional cinema by industry or theme
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Film className="w-5 h-5 text-cinema-accent" />
              Industries
            </h2>
            <div className="space-y-2">
              <Link
                to="/discover"
                className={`block px-4 py-3 rounded-xl transition-colors ${
                  !selectedIndustry
                    ? 'bg-cinema-accent text-cinema-dark font-medium'
                    : 'hover:bg-white/5'
                }`}
              >
                All Industries
              </Link>
              {INDUSTRIES.map((industry) => (
                <Link
                  key={industry.code}
                  to={`/discover?industry=${industry.code}`}
                  className={`block px-4 py-3 rounded-xl transition-colors ${
                    selectedIndustry === industry.code
                      ? 'bg-cinema-accent text-cinema-dark font-medium'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <span className="text-lg mr-2">{industry.flag}</span>
                  {industry.name}
                  <span className="text-xs text-cinema-text-secondary ml-2">
                    {industry.description}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cinema-accent" />
              Themes
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {THEMES.map((theme) => (
                <Link
                  key={theme.id}
                  to={`/discover?theme=${theme.id}`}
                  className={`flex flex-col items-center p-3 rounded-xl transition-colors ${
                    selectedTheme === theme.id
                      ? 'bg-cinema-accent text-cinema-dark'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <span className="text-2xl mb-1">{theme.icon}</span>
                  <span className="text-xs font-medium">{theme.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </aside>

        <main className="lg:col-span-3">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              {currentIndustry
                ? `${currentIndustry.flag} ${currentIndustry.name} Cinema`
                : currentTheme
                ? `${currentTheme.icon} ${currentTheme.label} Movies`
                : 'Popular Movies'}
            </h2>
            {movies.length > 0 && (
              <p className="text-cinema-text-secondary">
                {movies.length} movies found
              </p>
            )}
          </div>

          {loading && movies.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <MovieCardSkeleton key={i} />
              ))}
            </div>
          ) : movies.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {movies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>

              {hasMore && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="btn-secondary"
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <Film className="w-16 h-16 text-cinema-text-secondary mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No movies found</h2>
              <p className="text-cinema-text-secondary">
                Try selecting a different industry or theme
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
