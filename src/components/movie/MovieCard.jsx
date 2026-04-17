import { Link } from 'react-router-dom';
import { Star, Play } from 'lucide-react';
import { getTmdbImageUrl } from '../../lib/utils';
import { cn } from '../../lib/helpers';

export function MovieCard({ movie, variant = 'default', showRating = true, className }) {
  const posterUrl = movie.poster_path 
    ? getTmdbImageUrl(movie.poster_path, 'w342')
    : null;

  const backdropUrl = movie.backdrop_path
    ? getTmdbImageUrl(movie.backdrop_path, 'w780')
    : null;

  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;

  if (variant === 'hero') {
    return (
      <Link to={`/movie/${movie.id}`} className={cn('group relative block', className)}>
        <div className="relative aspect-video overflow-hidden rounded-2xl">
          {backdropUrl ? (
            <img
              src={backdropUrl}
              alt={movie.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-cinema-card flex items-center justify-center">
              <span className="text-cinema-text-secondary">No backdrop</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h2 className="text-3xl font-bold text-white mb-2">{movie.title}</h2>
            <p className="text-cinema-text-secondary line-clamp-2 max-w-2xl mb-3">
              {movie.overview}
            </p>
            <div className="flex items-center gap-4">
              {rating && showRating && (
                <div className="flex items-center gap-1 text-cinema-accent">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="font-semibold">{rating}</span>
                </div>
              )}
              {year && <span className="text-cinema-text-secondary">{year}</span>}
              {movie.runtime && (
                <span className="text-cinema-text-secondary">
                  {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                </span>
              )}
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-16 h-16 rounded-full bg-cinema-accent/90 flex items-center justify-center">
              <Play className="w-7 h-7 text-cinema-dark fill-current ml-1" />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link to={`/movie/${movie.id}`} className={cn('group flex gap-3', className)}>
        <div className="w-16 h-24 flex-shrink-0 overflow-hidden rounded-lg bg-cinema-card">
          {posterUrl ? (
            <img src={posterUrl} alt={movie.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-cinema-text-secondary text-xs">
              No img
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center">
          <h3 className="font-medium text-cinema-text group-hover:text-cinema-accent transition-colors line-clamp-1">
            {movie.title}
          </h3>
          {year && <span className="text-sm text-cinema-text-secondary">{year}</span>}
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/movie/${movie.id}`} className={cn('group block', className)}>
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-cinema-card card-hover">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-cinema-text-secondary">
            No poster
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="font-medium text-white text-sm line-clamp-2">{movie.title}</h3>
            {rating && showRating && (
              <div className="flex items-center gap-1 mt-1 text-cinema-accent">
                <Star className="w-3 h-3 fill-current" />
                <span className="text-xs">{rating}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-2">
        <h3 className="font-medium text-cinema-text line-clamp-1 group-hover:text-cinema-accent transition-colors">
          {movie.title}
        </h3>
        <div className="flex items-center gap-2 mt-1 text-sm text-cinema-text-secondary">
          {year && <span>{year}</span>}
          {movie.vote_count && movie.vote_count > 0 && (
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-cinema-accent fill-current" />
              {rating}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
