import { useState, useEffect } from 'react';
import { MovieCard } from '../components/movie/MovieCard';
import { FilterBar } from '../components/ui/FilterBar';
import { MovieCardSkeleton } from '../components/ui/Skeleton';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export function Movies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [filters, setFilters] = useState({
    industry: 'all',
    year: '',
    genre: '',
  });

  useEffect(() => {
    const fetchMovies = async () => {
      if (!isSupabaseConfigured()) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        let query = supabase
          .from('movies')
          .select('*')
          .order('created_at', { ascending: false })
          .range(0, 23);

        if (filters.industry && filters.industry !== 'all') {
          query = query.eq('language', filters.industry);
        }
        if (filters.year) {
          query = query.like('release_date', `${filters.year}%`);
        }

        const { data, error } = await query;
        
        if (error) throw error;
        setMovies(data || []);
        setHasMore((data?.length || 0) >= 24);
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
      let query = supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false })
        .range(page * 24, (page + 1) * 24 - 1);

      if (filters.industry && filters.industry !== 'all') {
        query = query.eq('language', filters.industry);
      }
      if (filters.year) {
        query = query.like('release_date', `${filters.year}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setMovies((prev) => [...prev, ...(data || [])]);
      setPage((prev) => prev + 1);
      setHasMore((data?.length || 0) >= 24);
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
