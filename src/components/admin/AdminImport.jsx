import { useState } from 'react';
import { Plus, Search, ExternalLink, Loader2, BookOpen, Film } from 'lucide-react';
import { tmdbApi } from '../../lib/tmdb';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export function AdminImport() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [movieData, setMovieData] = useState(null);
  const [credits, setCredits] = useState(null);
  const [wikiData, setWikiData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const searchMovies = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    setError('');
    setSearchResults([]);

    try {
      const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
      if (!API_KEY) {
        setError('TMDb API key not configured');
        setSearching(false);
        return;
      }

      const data = await tmdbApi.searchMovies(searchQuery);
      setSearchResults(data.results || []);
    } catch (err) {
      setError(err.message || 'Failed to search movies');
    } finally {
      setSearching(false);
    }
  };

  const fetchMovieFromTMDB = async (movieId) => {
    setLoading(true);
    setError('');
    setMovieData(null);
    setCredits(null);
    setWikiData(null);
    setSaved(false);
    setSearchResults([]);

    try {
      const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
      if (!API_KEY) {
        setError('TMDb API key not configured');
        setLoading(false);
        return;
      }

      const [movieRes, creditsRes] = await Promise.all([
        tmdbApi.getMovie(movieId),
        tmdbApi.getMovieCredits(movieId),
      ]);

      setMovieData(movieRes);
      setCredits(creditsRes);

      const wiki = await searchWikipediaForMovie(
        movieRes.title,
        movieRes.release_date?.split('-')[0]
      );
      setWikiData(wiki);
    } catch (err) {
      setError(err.message || 'Failed to fetch movie');
    } finally {
      setLoading(false);
    }
  };

  const saveMovieToSupabase = async () => {
    if (!movieData || !isSupabaseConfigured()) return;

    setSaving(true);
    try {
      const { data: movie, error: movieError } = await supabase
        .from('movies')
        .insert({
          tmdb_id: movieData.id,
          title: movieData.title,
          original_title: movieData.original_title,
          overview: movieData.overview,
          poster_path: movieData.poster_path,
          backdrop_path: movieData.backdrop_path,
          release_date: movieData.release_date,
          runtime: movieData.runtime,
          language: movieData.original_language,
          wiki_summary: wikiData?.extract || null,
          wiki_url: wikiData?.url || null,
          tmdb_rating: movieData.vote_average,
          tmdb_vote_count: movieData.vote_count,
          genres: movieData.genres?.map((g) => g.name) || [],
        })
        .select()
        .single();

      if (movieError) throw movieError;

      if (credits?.cast) {
        const castEntries = credits.cast.slice(0, 20).map((person) => ({
          tmdb_id: person.id,
          name: person.name,
          profile_path: person.profile_path,
          known_for_department: 'Acting',
        }));

        for (const entry of castEntries) {
          const { data: existingPerson } = await supabase
            .from('people')
            .select('id')
            .eq('tmdb_id', entry.tmdb_id)
            .single();

          let personId;
          if (existingPerson) {
            personId = existingPerson.id;
          } else {
            const { data: newPerson, error: personError } = await supabase
              .from('people')
              .insert(entry)
              .select('id')
              .single();
            if (personError) {
              console.error('Error creating person:', personError);
              continue;
            }
            personId = newPerson.id;
          }

          await supabase.from('movie_people').insert({
            movie_id: movie.id,
            person_id: personId,
            role_id: (await supabase.from('roles').select('id').eq('name', 'Actor').single()).data?.id,
            character_name: entry.character || null,
            order_index: entry.order,
          });
        }
      }

      setSaved(true);
      setMovieData(null);
      setCredits(null);
      setWikiData(null);
    } catch (err) {
      console.error('Error saving movie:', err);
      setError(err.message || 'Failed to save movie');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setMovieData(null);
    setCredits(null);
    setWikiData(null);
    setSaved(false);
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Import Movie from TMDb</h1>
        <p className="text-cinema-text-secondary">
          Search for movies or enter a TMDb ID to import
        </p>
      </div>

      {!movieData && (
        <div className="glass rounded-2xl p-6">
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cinema-text-secondary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchMovies()}
                placeholder="Search for a movie..."
                className="input-field pl-12"
              />
            </div>
            <button
              onClick={searchMovies}
              disabled={searching || !searchQuery.trim()}
              className="btn-secondary flex items-center gap-2"
            >
              {searching ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              Search
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {searchResults.map((movie) => (
                <button
                  key={movie.id}
                  onClick={() => fetchMovieFromTMDB(movie.id)}
                  className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors text-left"
                >
                  <div className="w-12 h-16 rounded-lg bg-cinema-card overflow-hidden flex-shrink-0">
                    {movie.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="w-6 h-6 text-cinema-text-secondary" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{movie.title}</p>
                    <p className="text-sm text-cinema-text-secondary">
                      {movie.release_date?.split('-')[0] || 'Unknown year'}
                      {movie.vote_average > 0 && ` • ${movie.vote_average.toFixed(1)}`}
                    </p>
                  </div>
                  <div className="text-xs text-cinema-text-secondary bg-cinema-card px-2 py-1 rounded">
                    ID: {movie.id}
                  </div>
                </button>
              ))}
            </div>
          )}

          {searchResults.length === 0 && searchQuery && !searching && (
            <p className="text-center text-cinema-text-secondary py-4">
              No movies found. Try a different search term.
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          {error}
        </div>
      )}

      {saved && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400">
          Movie imported successfully!
          <button onClick={resetForm} className="ml-4 underline hover:no-underline">
            Import another
          </button>
        </div>
      )}

      {loading && (
        <div className="glass rounded-2xl p-12 text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-cinema-accent" />
          <p className="text-cinema-text-secondary">Fetching movie details...</p>
        </div>
      )}

      {movieData && !loading && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-64 flex-shrink-0">
              <img
                src={`https://image.tmdb.org/t/p/w500${movieData.poster_path}`}
                alt={movieData.title}
                className="w-full aspect-[2/3] object-cover"
              />
            </div>
            <div className="flex-1 p-6">
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-2xl font-bold">{movieData.title}</h2>
                <button
                  onClick={resetForm}
                  className="text-cinema-text-secondary hover:text-cinema-text text-sm"
                >
                  Cancel
                </button>
              </div>
              {movieData.tagline && (
                <p className="text-cinema-text-secondary italic mb-4">{movieData.tagline}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-cinema-text-secondary mb-6">
                {movieData.release_date && (
                  <span>Release: {movieData.release_date}</span>
                )}
                {movieData.runtime && (
                  <span>Runtime: {movieData.runtime} min</span>
                )}
                {movieData.vote_average > 0 && (
                  <span>Rating: {movieData.vote_average.toFixed(1)}</span>
                )}
              </div>

              {movieData.genres && movieData.genres.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {movieData.genres.map((genre) => (
                      <span
                        key={genre.id}
                        className="px-3 py-1 bg-cinema-card rounded-full text-sm"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {movieData.overview && (
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Overview</h3>
                  <p className="text-cinema-text-secondary text-sm">
                    {movieData.overview}
                  </p>
                </div>
              )}

              {wikiData && (
                <div className="mb-6 p-4 bg-cinema-accent/10 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-5 h-5 text-cinema-accent" />
                    <h3 className="font-medium">Wikipedia Context</h3>
                  </div>
                  <p className="text-sm text-cinema-text-secondary line-clamp-4">
                    {wikiData.extract}
                  </p>
                  {wikiData.url && (
                    <a
                      href={wikiData.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cinema-accent hover:underline text-sm flex items-center gap-1 mt-2"
                    >
                      Read more on Wikipedia
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}

              {credits?.cast && credits.cast.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Cast ({credits.cast.length})</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {credits.cast.slice(0, 12).map((person) => (
                      <div key={person.id} className="text-center">
                        <div className="w-16 h-16 mx-auto rounded-full bg-cinema-card overflow-hidden mb-1">
                          {person.profile_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                              alt={person.name}
                              className="w-full h-full object-cover"
                            />
                          ) : null}
                        </div>
                        <p className="text-xs font-medium truncate">{person.name}</p>
                        {person.character && (
                          <p className="text-xs text-cinema-text-secondary truncate">
                            {person.character}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={saveMovieToSupabase}
                disabled={saving}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Save to Database
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

async function searchWikipediaForMovie(title, year) {
  try {
    const searchQuery = year ? `${title} ${year} film` : `${title} film`;
    const url = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(searchQuery)}&limit=5&format=json&origin=*`;
    const response = await fetch(url);
    const data = await response.json();

    if (data && data[1] && data[1].length > 0) {
      const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(data[1][0].replace(/ /g, '_'))}`;
      const summaryRes = await fetch(summaryUrl);
      const summary = await summaryRes.json();
      return {
        title: summary.title,
        extract: summary.extract,
        url: summary.content_urls?.desktop?.page,
      };
    }
    return null;
  } catch (error) {
    console.error('Wikipedia search failed:', error);
    return null;
  }
}
