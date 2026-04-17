import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, ExternalLink, Loader2, BookOpen } from 'lucide-react';
import { tmdbApi } from '../../lib/tmdb';
import { searchWikipediaForPerson } from '../../lib/wikipedia';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { moviePersonDefault, personDefault } from '../../lib/defaults';

export function AdminImport() {
  const [tmdbId, setTmdbId] = useState('');
  const [loading, setLoading] = useState(false);
  const [movieData, setMovieData] = useState(null);
  const [credits, setCredits] = useState(null);
  const [wikiData, setWikiData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const fetchMovieFromTMDB = async () => {
    if (!tmdbId.trim()) return;
    
    setLoading(true);
    setError('');
    setMovieData(null);
    setCredits(null);
    setWikiData(null);
    setSaved(false);

    try {
      const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
      if (!API_KEY) {
        setError('TMDb API key not configured');
        setLoading(false);
        return;
      }

      const [movieRes, creditsRes] = await Promise.all([
        tmdbApi.getMovie(tmdbId),
        tmdbApi.getMovieCredits(tmdbId),
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
      setTmdbId('');
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Import Movie from TMDb</h1>
        <p className="text-cinema-text-secondary">
          Enter a TMDb movie ID to fetch and import movie data
        </p>
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="flex gap-4">
          <input
            type="number"
            value={tmdbId}
            onChange={(e) => setTmdbId(e.target.value)}
            placeholder="Enter TMDb Movie ID (e.g., 603)"
            className="input-field flex-1"
          />
          <button
            onClick={fetchMovieFromTMDB}
            disabled={loading || !tmdbId.trim()}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Fetching...
              </>
            ) : (
              'Fetch Movie'
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          {error}
        </div>
      )}

      {saved && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400">
          Movie imported successfully!
        </div>
      )}

      {movieData && (
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
              <h2 className="text-2xl font-bold mb-2">{movieData.title}</h2>
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
