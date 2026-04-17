import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MovieCard } from '../components/movie/MovieCard';
import { PersonCard } from '../components/person/PersonCard';
import { MovieCardSkeleton, PersonCardSkeleton } from '../components/ui/Skeleton';
import { tmdbApi } from '../lib/tmdb';
import { Film, User, Loader2 } from 'lucide-react';

export function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(query);
  const [movies, setMovies] = useState([]);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setSearchParams({ q: searchQuery.trim() });

    try {
      const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
      if (!API_KEY) {
        setLoading(false);
        return;
      }

      const [moviesRes, peopleRes] = await Promise.all([
        tmdbApi.searchMovies(searchQuery),
        tmdbApi.searchPeople(searchQuery),
      ]);

      setMovies(moviesRes.results || []);
      setPeople(peopleRes.results || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const displayedMovies = activeTab === 'all' || activeTab === 'movies' ? movies : [];
  const displayedPeople = activeTab === 'all' || activeTab === 'people' ? people : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gradient mb-4">Search</h1>
        <form onSubmit={handleSubmit} className="max-w-2xl">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for movies, actors, directors..."
              className="w-full bg-cinema-card border border-cinema-border rounded-2xl py-4 px-6 text-lg text-cinema-text placeholder:text-cinema-text-secondary focus:outline-none focus:border-cinema-accent transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-4 top-1/2 -translate-y-1/2 btn-primary py-2 px-4"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
            </button>
          </div>
        </form>

        <div className="flex gap-4 mt-4 border-b border-cinema-border">
          {[
            { value: 'all', label: 'All', count: movies.length + people.length },
            { value: 'movies', label: 'Movies', count: movies.length, icon: Film },
            { value: 'people', label: 'People', count: people.length, icon: User },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`pb-3 px-1 font-medium flex items-center gap-2 transition-colors ${
                activeTab === tab.value
                  ? 'text-cinema-accent border-b-2 border-cinema-accent'
                  : 'text-cinema-text-secondary hover:text-cinema-text'
              }`}
            >
              {tab.icon && <tab.icon className="w-4 h-4" />}
              {tab.label}
              {tab.count > 0 && (
                <span className="text-sm">({tab.count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Film className="w-5 h-5 text-cinema-accent" />
              Movies
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <MovieCardSkeleton key={i} />
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-cinema-accent" />
              People
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <PersonCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      ) : hasSearched ? (
        <>
          {displayedMovies.length > 0 && (
            <div className="mb-12">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Film className="w-5 h-5 text-cinema-accent" />
                Movies ({displayedMovies.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {displayedMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            </div>
          )}

          {displayedPeople.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-cinema-accent" />
                People ({displayedPeople.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {displayedPeople.map((person) => (
                  <PersonCard key={person.id} person={person} />
                ))}
              </div>
            </div>
          )}

          {displayedMovies.length === 0 && displayedPeople.length === 0 && (
            <div className="text-center py-20">
              <Film className="w-16 h-16 text-cinema-text-secondary mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No results found</h2>
              <p className="text-cinema-text-secondary">
                Try searching with different keywords
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <Film className="w-16 h-16 text-cinema-text-secondary mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Start searching</h2>
          <p className="text-cinema-text-secondary">
            Search for movies, actors, directors, and more
          </p>
        </div>
      )}
    </div>
  );
}
