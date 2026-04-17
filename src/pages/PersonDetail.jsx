import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Film, ExternalLink } from 'lucide-react';
import { getTmdbImageUrl, formatDate } from '../lib/utils';
import { MovieCard } from '../components/movie/MovieCard';
import { Badge } from '../components/ui/Badge';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export function PersonDetail() {
  const { id } = useParams();
  const [person, setPerson] = useState(null);
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPersonData = async () => {
      if (!isSupabaseConfigured()) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data: personData, error: personError } = await supabase
          .from('people')
          .select(`
            *,
            movie_people (
              *,
              movies (id, title, poster_path, release_date),
              roles (name)
            )
          `)
          .eq('id', id)
          .single();

        if (personError) throw personError;
        setPerson(personData);
      } catch (error) {
        console.error('Error fetching person:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonData();
  }, [id]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            <div className="w-64 h-80 rounded-2xl bg-cinema-card" />
            <div className="flex-1 space-y-4">
              <div className="h-10 w-64 bg-cinema-card rounded" />
              <div className="h-6 w-48 bg-cinema-card rounded" />
              <div className="h-24 w-full bg-cinema-card rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-cinema-text-secondary">Person not found</p>
      </div>
    );
  }

  const movies = credits?.cast || [];
  const directorMovies = movies.filter((m) => {
    const credit = credits?.crew?.find((c) => c.id === person.id && c.department === 'Directing');
    return credit;
  });
  const actedMovies = movies.filter((m) => {
    return !directorMovies.includes(m);
  });

  const groupedByYear = movies.reduce((acc, movie) => {
    const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown';
    if (!acc[year]) acc[year] = [];
    acc[year].push(movie);
    return acc;
  }, {});

  return (
    <div className="animate-fade-in">
      <div className="bg-gradient-to-b from-cinema-card to-cinema-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-48 md:w-64 flex-shrink-0 mx-auto md:mx-0">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-cinema-card shadow-2xl">
                {person.profile_path ? (
                  <img
                    src={getTmdbImageUrl(person.profile_path, 'h632')}
                    alt={person.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-cinema-text-secondary">
                    <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold text-white mb-2">{person.name}</h1>
              
              {person.known_for_department && (
                <Badge variant="primary" className="mb-4">
                  {person.known_for_department}
                </Badge>
              )}

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-cinema-text-secondary mb-6">
                {person.birthday && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Born {formatDate(person.birthday)}
                    {person.age && <span>({person.age} years old)</span>}
                  </div>
                )}
                {person.place_of_birth && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {person.place_of_birth}
                  </div>
                )}
              </div>

              {person.biography && (
                <p className="text-cinema-text-secondary leading-relaxed max-w-3xl line-clamp-4">
                  {person.biography}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cinema-accent">{movies.length}</div>
                  <div className="text-sm text-cinema-text-secondary">Movies</div>
                </div>
                {person.popularity && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cinema-accent">
                      {Math.round(person.popularity)}
                    </div>
                    <div className="text-sm text-cinema-text-secondary">Popularity</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {wikiData && (
          <div className="mb-12 glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-cinema-accent" />
                Wikipedia
              </h2>
              <a
                href={wikiData.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cinema-accent hover:text-cinema-accent-hover text-sm flex items-center gap-1"
              >
                Read more
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <p className="text-cinema-text-secondary leading-relaxed">
              {wikiData.extract}
            </p>
          </div>
        )}

        {movies.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Film className="w-6 h-6 text-cinema-accent" />
              Filmography
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {movies.slice(0, 18).map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>

            {movies.length > 18 && (
              <div className="mt-8 text-center">
                <p className="text-cinema-text-secondary">
                  And {movies.length - 18} more movies...
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
