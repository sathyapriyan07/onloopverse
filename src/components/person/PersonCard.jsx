import { Link } from 'react-router-dom';
import { getTmdbImageUrl } from '../../lib/utils';
import { cn } from '../../lib/helpers';

export function PersonCard({ person, variant = 'default', className }) {
  const profileUrl = person.profile_path
    ? getTmdbImageUrl(person.profile_path, 'w185')
    : null;

  if (variant === 'compact') {
    return (
      <Link to={`/person/${person.id}`} className={cn('group flex flex-col items-center', className)}>
        <div className="w-20 h-20 rounded-full overflow-hidden bg-cinema-card border-2 border-transparent group-hover:border-cinema-accent transition-colors">
          {profileUrl ? (
            <img src={profileUrl} alt={person.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-cinema-text-secondary text-xs">
              No img
            </div>
          )}
        </div>
        <h4 className="mt-2 text-sm font-medium text-cinema-text text-center line-clamp-1 group-hover:text-cinema-accent transition-colors">
          {person.name}
        </h4>
        {person.character && (
          <p className="text-xs text-cinema-text-secondary text-center line-clamp-1">
            {person.character}
          </p>
        )}
      </Link>
    );
  }

  return (
    <Link to={`/person/${person.id}`} className={cn('group block', className)}>
      <div className="aspect-square overflow-hidden rounded-xl bg-cinema-card card-hover">
        {profileUrl ? (
          <img
            src={profileUrl}
            alt={person.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-cinema-text-secondary">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
      </div>
      <div className="mt-3">
        <h3 className="font-medium text-cinema-text group-hover:text-cinema-accent transition-colors line-clamp-1">
          {person.name}
        </h3>
        {person.known_for_department && (
          <p className="text-sm text-cinema-text-secondary mt-1">
            {person.known_for_department}
          </p>
        )}
      </div>
    </Link>
  );
}
