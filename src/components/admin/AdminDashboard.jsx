import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Film, Users, Award, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    movies: 0,
    people: 0,
    awards: 0,
  });
  const [recentMovies, setRecentMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!isSupabaseConfigured()) {
        setLoading(false);
        return;
      }

      try {
        const [moviesCount, peopleCount, awardsCount, moviesData] = await Promise.all([
          supabase.from('movies').select('*', { count: 'exact' }),
          supabase.from('people').select('*', { count: 'exact' }),
          supabase.from('awards').select('*', { count: 'exact' }),
          supabase.from('movies').select('*').order('created_at', { ascending: false }).limit(5),
        ]);

        setStats({
          movies: moviesCount.count || 0,
          people: peopleCount.count || 0,
          awards: awardsCount.count || 0,
        });
        setRecentMovies(moviesData.data || []);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: 'Movies', value: stats.movies, icon: Film, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'People', value: stats.people, icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Awards', value: stats.awards, icon: Award, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-cinema-text-secondary">Welcome to OnloopVerse Admin</p>
        </div>
        <Link to="/admin/import" className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Import Movie
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold">{loading ? '...' : stat.value}</div>
            <div className="text-cinema-text-secondary">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Recent Movies</h2>
          <Link to="/admin/movies" className="text-cinema-accent hover:text-cinema-accent-hover flex items-center gap-1 text-sm">
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-cinema-card rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recentMovies.length > 0 ? (
          <div className="space-y-3">
            {recentMovies.map((movie) => (
              <Link
                key={movie.id}
                to={`/movie/${movie.id}`}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className="w-12 h-16 rounded-lg bg-cinema-card overflow-hidden flex-shrink-0">
                  {movie.poster_path && (
                    <img
                      src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{movie.title}</p>
                  <p className="text-sm text-cinema-text-secondary">
                    {movie.release_date?.split('-')[0] || 'Unknown year'}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-cinema-text-secondary" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-cinema-text-secondary">
            No movies yet. Start by importing a movie.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/admin/import"
              className="flex items-center gap-3 p-4 rounded-xl bg-cinema-accent/10 hover:bg-cinema-accent/20 transition-colors"
            >
              <Plus className="w-5 h-5 text-cinema-accent" />
              <span className="font-medium">Import Movie from TMDb</span>
            </Link>
            <Link
              to="/admin/people"
              className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/5 transition-colors"
            >
              <Users className="w-5 h-5 text-cinema-text-secondary" />
              <span className="font-medium">Manage People</span>
            </Link>
            <Link
              to="/admin/awards"
              className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/5 transition-colors"
            >
              <Award className="w-5 h-5 text-cinema-text-secondary" />
              <span className="font-medium">Manage Awards</span>
            </Link>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Getting Started</h2>
          <ol className="space-y-4 text-cinema-text-secondary">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cinema-accent text-cinema-dark flex items-center justify-center text-sm font-bold">1</span>
              <p>Import a movie using a TMDb ID from the Import section</p>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cinema-accent text-cinema-dark flex items-center justify-center text-sm font-bold">2</span>
              <p>Add Wikipedia context to enrich the movie data</p>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cinema-accent text-cinema-dark flex items-center justify-center text-sm font-bold">3</span>
              <p>Assign roles and add awards information</p>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
