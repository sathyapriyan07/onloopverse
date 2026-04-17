import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Film, User, X } from 'lucide-react';
import { debounce } from '../../lib/helpers';

export function SearchBar({ 
  placeholder = 'Search movies, people...', 
  className,
  autoFocus = false 
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState({ movies: [], people: [] });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
    setQuery('');
  }, [location]);

  const searchTMDB = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults({ movies: [], people: [] });
      return;
    }

    setLoading(true);
    try {
      const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
      if (!API_KEY) {
        setResults({ movies: [], people: [] });
        return;
      }

      const [moviesRes, peopleRes] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}&include_adult=false`),
        fetch(`https://api.themoviedb.org/3/search/person?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}`),
      ]);

      const moviesData = await moviesRes.json();
      const peopleData = await peopleRes.json();

      setResults({
        movies: moviesData.results?.slice(0, 5) || [],
        people: peopleData.results?.slice(0, 5) || [],
      });
    } catch (error) {
      console.error('Search error:', error);
      setResults({ movies: [], people: [] });
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(debounce(searchTMDB, 300), []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.trim()) {
      setIsOpen(true);
      debouncedSearch(value);
    } else {
      setIsOpen(false);
      setResults({ movies: [], people: [] });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
    }
  };

  const handleResultClick = (type, id) => {
    navigate(`/${type}/${id}`);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cinema-text-secondary" />
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => query.trim() && setIsOpen(true)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className="w-full bg-cinema-card border border-cinema-border rounded-2xl py-3 pl-12 pr-12 text-cinema-text placeholder:text-cinema-text-secondary focus:outline-none focus:border-cinema-accent transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setIsOpen(false);
                setResults({ movies: [], people: [] });
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-cinema-text-secondary" />
            </button>
          )}
        </div>
      </form>

      {isOpen && (results.movies.length > 0 || results.people.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 py-2 glass rounded-xl shadow-2xl max-h-96 overflow-y-auto z-50">
          {results.movies.length > 0 && (
            <div className="px-3 py-2">
              <div className="flex items-center gap-2 text-xs text-cinema-text-secondary uppercase tracking-wider mb-2 px-2">
                <Film className="w-3 h-3" />
                Movies
              </div>
              {results.movies.map((movie) => (
                <button
                  key={movie.id}
                  onClick={() => handleResultClick('movie', movie.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-left"
                >
                  <div className="w-10 h-14 rounded bg-cinema-card overflow-hidden flex-shrink-0">
                    {movie.poster_path && (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-cinema-text truncate">{movie.title}</p>
                    {movie.release_date && (
                      <p className="text-sm text-cinema-text-secondary">
                        {new Date(movie.release_date).getFullYear()}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {results.people.length > 0 && (
            <div className="px-3 py-2">
              <div className="flex items-center gap-2 text-xs text-cinema-text-secondary uppercase tracking-wider mb-2 px-2">
                <User className="w-3 h-3" />
                People
              </div>
              {results.people.map((person) => (
                <button
                  key={person.id}
                  onClick={() => handleResultClick('person', person.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-cinema-card overflow-hidden flex-shrink-0">
                    {person.profile_path && (
                      <img
                        src={`https://image.tmdb.org/t/p/w45${person.profile_path}`}
                        alt={person.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-cinema-text truncate">{person.name}</p>
                    {person.known_for_department && (
                      <p className="text-sm text-cinema-text-secondary truncate">
                        {person.known_for_department}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="px-3 py-2 border-t border-cinema-border mt-2">
            <button
              onClick={handleSubmit}
              className="w-full text-center text-sm text-cinema-accent hover:text-cinema-accent-hover transition-colors"
            >
              See all results for "{query}"
            </button>
          </div>
        </div>
      )}

      {isOpen && loading && (
        <div className="absolute top-full left-0 right-0 mt-2 py-4 glass rounded-xl shadow-2xl z-50">
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-cinema-accent border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      )}
    </div>
  );
}
