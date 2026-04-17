import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Clock, Calendar, Globe, Play, Award, Users, ExternalLink } from 'lucide-react';
import { getTmdbImageUrl, formatRuntime, formatDate } from '../lib/utils';
import { MovieCard } from '../components/movie/MovieCard';
import { MovieDetailSkeleton } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [credits, setCredits] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchMovieData = async () => {
      if (!isSupabaseConfigured()) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data: movieData, error: movieError } = await supabase
          .from('movies')
          .select(`
            *,
            industries (name),
            movie_people (
              *,
              people (id, name, profile_path),
              roles (name)
            ),
            movie_awards (
              *,
              awards (name),
              people (name)
            )
          `)
          .eq('id', id)
          .single();

        if (movieError) throw movieError;
        setMovie(movieData);

        const { data: recsData } = await supabase
          .from('movies')
          .select('*')
          .eq('language', movieData.language)
          .neq('id', id)
          .limit(6);
        setRecommendations(recsData || []);
      } catch (error) {
        console.error('Error fetching movie:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [id]);

  if (loading) {
    return <MovieDetailSkeleton />;
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-cinema-text-secondary">Movie not found</p>
      </div>
    );
  }

  const director = credits?.crew?.find((c) => c.job === 'Director');
  const composer = credits?.crew?.find((c) => c.job === 'Original Music Composer' || c.department === 'Sound');
  const cast = credits?.cast?.slice(0, 20) || [];
  const writers = credits?.crew?.filter((c) => ['Screenplay', 'Story', 'Writer'].includes(c.job)) || [];
  const trailer = movie.videos?.results?.find((v) => v.type === 'Trailer' && v.site === 'YouTube');

  return (
    <div className="animate-fade-in">
      <div className="relative">
        <div className="w-full aspect-[21/9] overflow-hidden">
          {movie.backdrop_path ? (
            <img
              src={getTmdbImageUrl(movie.backdrop_path, 'original')}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-cinema-card" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-cinema-dark via-cinema-dark/60 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="hidden md:block w-64 flex-shrink-0">
                <div className="rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={getTmdbImageUrl(movie.poster_path, 'w500')}
                    alt={movie.title}
                    className="w-full aspect-[2/3] object-cover"
                  />
                </div>
              </div>

              <div className="flex-1 pt-4 md:pt-0">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {movie.title}
                </h1>
                {movie.tagline && (
                  <p className="text-cinema-text-secondary italic mb-4">{movie.tagline}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 mb-6">
                  {movie.vote_average > 0 && (
                    <div className="flex items-center gap-1 text-cinema-accent">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="font-semibold">{movie.vote_average.toFixed(1)}</span>
                      <span className="text-cinema-text-secondary">({movie.vote_count})</span>
                    </div>
                  )}
                  {movie.release_date && (
                    <div className="flex items-center gap-1 text-cinema-text-secondary">
                      <Calendar className="w-4 h-4" />
                      {formatDate(movie.release_date)}
                    </div>
                  )}
                  {movie.runtime && (
                    <div className="flex items-center gap-1 text-cinema-text-secondary">
                      <Clock className="w-4 h-4" />
                      {formatRuntime(movie.runtime)}
                    </div>
                  )}
                  {movie.original_language && (
                    <div className="flex items-center gap-1 text-cinema-text-secondary">
                      <Globe className="w-4 h-4" />
                      {movie.original_language.toUpperCase()}
                    </div>
                  )}
                </div>

                {movie.genres && movie.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {movie.genres.map((genre) => (
                      <Badge key={genre.id} variant="default">
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                )}

                {trailer && (
                  <a
                    href={`https://www.youtube.com/watch?v=${trailer.key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 btn-primary mb-6"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    Watch Trailer
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex gap-4 mb-6 border-b border-cinema-border">
              {['overview', 'cast', 'crew', 'wiki'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 px-1 font-medium transition-colors ${
                    activeTab === tab
                      ? 'text-cinema-accent border-b-2 border-cinema-accent'
                      : 'text-cinema-text-secondary hover:text-cinema-text'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Synopsis</h3>
                  <p className="text-cinema-text-secondary leading-relaxed">
                    {movie.overview || 'No synopsis available.'}
                  </p>
                </div>

                {movie.production_companies && movie.production_companies.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Production</h3>
                    <div className="flex flex-wrap gap-2">
                      {movie.production_companies.slice(0, 5).map((company) => (
                        <Badge key={company.id} variant="default">
                          {company.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {movie.budget > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Budget</h3>
                    <p className="text-cinema-text-secondary">
                      ${movie.budget.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'cast' && (
              <div className="animate-fade-in">
                <h3 className="text-lg font-semibold mb-4">Cast</h3>
                {cast.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {cast.map((person) => (
                      <Link
                        key={person.id}
                        to={`/person/${person.id}`}
                        className="group"
                      >
                        <div className="aspect-square rounded-xl overflow-hidden bg-cinema-card mb-2">
                          {person.profile_path ? (
                            <img
                              src={getTmdbImageUrl(person.profile_path, 'w185')}
                              alt={person.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-cinema-text-secondary">
                              No image
                            </div>
                          )}
                        </div>
                        <p className="font-medium text-sm group-hover:text-cinema-accent transition-colors truncate">
                          {person.name}
                        </p>
                        <p className="text-xs text-cinema-text-secondary truncate">
                          {person.character || 'Unknown'}
                        </p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-cinema-text-secondary">No cast information available.</p>
                )}
              </div>
            )}

            {activeTab === 'crew' && (
              <div className="space-y-6 animate-fade-in">
                {director && (
                  <div>
                    <h3 className="text-sm text-cinema-text-secondary mb-2">Director</h3>
                    <Link
                      to={`/person/${director.id}`}
                      className="flex items-center gap-3 group"
                    >
                      <div className="w-12 h-12 rounded-full bg-cinema-card overflow-hidden">
                        {director.profile_path ? (
                          <img
                            src={getTmdbImageUrl(director.profile_path, 'w185')}
                            alt={director.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-cinema-text-secondary text-xs">
                            No img
                          </div>
                        )}
                      </div>
                      <span className="font-medium group-hover:text-cinema-accent transition-colors">
                        {director.name}
                      </span>
                    </Link>
                  </div>
                )}

                {writers.length > 0 && (
                  <div>
                    <h3 className="text-sm text-cinema-text-secondary mb-2">Writers</h3>
                    <div className="flex flex-wrap gap-2">
                      {writers.slice(0, 5).map((writer) => (
                        <Link
                          key={writer.id}
                          to={`/person/${writer.id}`}
                          className="flex items-center gap-2 px-3 py-2 bg-cinema-card rounded-lg group"
                        >
                          <div className="w-8 h-8 rounded-full bg-cinema-card-hover overflow-hidden">
                            {writer.profile_path ? (
                              <img
                                src={getTmdbImageUrl(writer.profile_path, 'w45')}
                                alt={writer.name}
                                className="w-full h-full object-cover"
                              />
                            ) : null}
                          </div>
                          <span className="text-sm group-hover:text-cinema-accent transition-colors">
                            {writer.name}
                          </span>
                          <span className="text-xs text-cinema-text-secondary">({writer.job})</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {composer && (
                  <div>
                    <h3 className="text-sm text-cinema-text-secondary mb-2">Music</h3>
                    <Link
                      to={`/person/${composer.id}`}
                      className="flex items-center gap-3 group"
                    >
                      <div className="w-12 h-12 rounded-full bg-cinema-card overflow-hidden">
                        {composer.profile_path ? (
                          <img
                            src={getTmdbImageUrl(composer.profile_path, 'w185')}
                            alt={composer.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-cinema-text-secondary text-xs">
                            No img
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="font-medium group-hover:text-cinema-accent transition-colors">
                          {composer.name}
                        </span>
                        <p className="text-xs text-cinema-text-secondary">Composer</p>
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'wiki' && (
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Wikipedia Context</h3>
                  {wikiData?.url && (
                    <a
                      href={wikiData.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-cinema-accent hover:text-cinema-accent-hover text-sm"
                    >
                      Read on Wikipedia
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                
                {wikiData ? (
                  <div className="prose prose-invert max-w-none">
                    <p className="text-cinema-text-secondary leading-relaxed">
                      {wikiData.extract}
                    </p>
                    {wikiData.thumbnail && (
                      <div className="mt-4">
                        <img
                          src={wikiData.thumbnail}
                          alt={wikiData.title}
                          className="rounded-xl max-w-md"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-cinema-text-secondary">
                    No Wikipedia information available for this movie.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-cinema-accent" />
                Top Cast
              </h3>
              <div className="space-y-3">
                {cast.slice(0, 5).map((person) => (
                  <Link
                    key={person.id}
                    to={`/person/${person.id}`}
                    className="flex items-center gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-cinema-card overflow-hidden flex-shrink-0">
                      {person.profile_path ? (
                        <img
                          src={getTmdbImageUrl(person.profile_path, 'w45')}
                          alt={person.name}
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-cinema-accent transition-colors">
                        {person.name}
                      </p>
                      <p className="text-xs text-cinema-text-secondary truncate">
                        {person.character || 'Unknown'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {recommendations.length > 0 && (
              <div className="glass rounded-2xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-cinema-accent" />
                  Similar Movies
                </h3>
                <div className="space-y-3">
                  {recommendations.slice(0, 4).map((rec) => (
                    <MovieCard key={rec.id} movie={rec} variant="compact" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
