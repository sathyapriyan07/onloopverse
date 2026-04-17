import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export function AdminMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('movies')
        .select(`
          *,
          industries (name),
          movie_awards (count),
          movie_people (count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMovies(data || []);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMovie = async (id) => {
    if (!confirm('Are you sure you want to delete this movie?')) return;

    try {
      const { error } = await supabase.from('movies').delete().eq('id', id);
      if (error) throw error;
      setMovies((prev) => prev.filter((m) => m.id !== id));
    } catch (error) {
      console.error('Error deleting movie:', error);
      alert('Failed to delete movie');
    }
  };

  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cinema-text-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movies..."
            className="input-field pl-12"
          />
        </div>
        <Link to="/admin/import" className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Import Movie
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-cinema-card rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredMovies.length > 0 ? (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cinema-border">
                  <th className="text-left p-4 font-medium text-cinema-text-secondary">Movie</th>
                  <th className="text-left p-4 font-medium text-cinema-text-secondary">Year</th>
                  <th className="text-left p-4 font-medium text-cinema-text-secondary">Industry</th>
                  <th className="text-left p-4 font-medium text-cinema-text-secondary">Rating</th>
                  <th className="text-left p-4 font-medium text-cinema-text-secondary">Awards</th>
                  <th className="text-right p-4 font-medium text-cinema-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovies.map((movie) => (
                  <tr key={movie.id} className="border-b border-cinema-border/50 hover:bg-white/5">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-14 rounded-lg bg-cinema-card overflow-hidden flex-shrink-0">
                          {movie.poster_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                              alt={movie.title}
                              className="w-full h-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div>
                          <p className="font-medium">{movie.title}</p>
                          {movie.wiki_url && (
                            <a
                              href={movie.wiki_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-cinema-accent hover:underline flex items-center gap-1"
                            >
                              Wikipedia
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-cinema-text-secondary">
                      {movie.release_date?.split('-')[0] || '-'}
                    </td>
                    <td className="p-4 text-cinema-text-secondary">
                      {movie.industries?.name || movie.language?.toUpperCase() || '-'}
                    </td>
                    <td className="p-4">
                      {movie.tmdb_rating ? (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm">
                          {movie.tmdb_rating}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="p-4 text-cinema-text-secondary">
                      {movie.movie_awards?.[0]?.count || 0}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/movie/${movie.id}`}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                          title="View"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => deleteMovie(movie.id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 glass rounded-2xl">
          <p className="text-cinema-text-secondary mb-4">No movies found</p>
          <Link to="/admin/import" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Import your first movie
          </Link>
        </div>
      )}
    </div>
  );
}
