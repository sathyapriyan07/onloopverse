import { useState, useEffect } from 'react';
import { MovieCard } from '../components/movie/MovieCard';
import { FilterBar } from '../components/ui/FilterBar';
import { SectionSkeleton, MovieCardSkeleton } from '../components/ui/Skeleton';
import { tmdbApi } from '../lib/tmdb';

const INDUSTRIES = [
  { value: 'all', label: 'All' },
  { value: 'ta', label: 'Tamil' },
  { value: 'te', label: 'Telugu' },
  { value: 'ml', label: 'Malayalam' },
  { value: 'hi', label: 'Hindi' },
  { value: 'kn', label: 'Kannada' },
];

export function Movies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({
    industry: 'all',
    year: '',
    genre: '',
  });

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
        if (!API_KEY) {
          setLoading(false);
          return;
        }

        const params = {
          page: 1,
          sort_by: 'popularity.desc',
          include_adult: false,
        };

        if (filters.industry && filters.industry !== 'all') {
          params.with_original_language = filters.industry;
        }
        if (filters.year) {
          params.primary_release_year = parseInt(filters.year);
        }
        if (filters.genre) {
          params.with_genres = filters.genre;
        }

        const data = await tmdbApi.discoverMovies(params);
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
  }, [filters]);

  const loadMore = async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    try {
      const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
      const params = {
        page: page + 1,
        sort_by: 'popularity.desc',
      };

      if (filters.industry && filters.industry !== 'all') {
        params.with_original_language = filters.industry;
      }
      if (filters.year) {
        params.primary_release_year = parseInt(filters.year);
      }
      if (filters.genre) {
        params.with_genres = filters.genre;
      }

      const data = await tmdbApi.discoverMovies(params);
      setMovies((prev) => [...prev, ...(data.results || [])]);
      setPage((prev) => prev + 1);
      setHasMore(data.total_pages > page + 1);
    } catch (error) {
      console.error('Error loading more movies:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Movies</h1>
          <p className="text-cinema-text-secondary mt-1">
            Explore regional cinema from across India
          </p>
        </div>
      </div>

      <div className="mb-8">
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
        />
      </div>

      {loading && movies.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      ) : movies.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-12 flex justify-center">
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
          <p className="text-cinema-text-secondary text-lg">
            No movies found. Try adjusting your filters.
          </p>
        </div>
      )}
    </div>
  );
}
