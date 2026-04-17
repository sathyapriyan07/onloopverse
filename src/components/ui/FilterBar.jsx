import { Filter, X } from 'lucide-react';
import { cn } from '../../lib/helpers';

const INDUSTRIES = [
  { value: 'all', label: 'All Industries' },
  { value: 'ta', label: 'Tamil', name: 'Tamil Cinema' },
  { value: 'te', label: 'Telugu', name: 'Telugu Cinema' },
  { value: 'ml', label: 'Malayalam', name: 'Malayalam Cinema' },
  { value: 'hi', label: 'Hindi', name: 'Bollywood' },
  { value: 'kn', label: 'Kannada', name: 'Kannada Cinema' },
];

const YEARS = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

const GENRES = [
  { value: '28', label: 'Action' },
  { value: '12', label: 'Adventure' },
  { value: '35', label: 'Comedy' },
  { value: '80', label: 'Crime' },
  { value: '18', label: 'Drama' },
  { value: '14', label: 'Fantasy' },
  { value: '27', label: 'Horror' },
  { value: '9648', label: 'Mystery' },
  { value: '10749', label: 'Romance' },
  { value: '53', label: 'Thriller' },
];

export function FilterBar({ 
  filters, 
  onFilterChange, 
  showGenres = true,
  className 
}) {
  const updateFilter = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      industry: 'all',
      year: '',
      genre: '',
    });
  };

  const hasActiveFilters = filters.industry !== 'all' || filters.year || filters.genre;

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      <div className="flex items-center gap-2 text-cinema-text-secondary">
        <Filter className="w-4 h-4" />
        <span className="text-sm">Filters:</span>
      </div>

      <select
        value={filters.industry}
        onChange={(e) => updateFilter('industry', e.target.value)}
        className="bg-cinema-card border border-cinema-border rounded-lg px-3 py-2 text-sm text-cinema-text focus:outline-none focus:border-cinema-accent transition-colors cursor-pointer"
      >
        {INDUSTRIES.map((ind) => (
          <option key={ind.value} value={ind.value}>
            {ind.label}
          </option>
        ))}
      </select>

      <select
        value={filters.year}
        onChange={(e) => updateFilter('year', e.target.value)}
        className="bg-cinema-card border border-cinema-border rounded-lg px-3 py-2 text-sm text-cinema-text focus:outline-none focus:border-cinema-accent transition-colors cursor-pointer"
      >
        <option value="">All Years</option>
        {YEARS.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>

      {showGenres && (
        <select
          value={filters.genre}
          onChange={(e) => updateFilter('genre', e.target.value)}
          className="bg-cinema-card border border-cinema-border rounded-lg px-3 py-2 text-sm text-cinema-text focus:outline-none focus:border-cinema-accent transition-colors cursor-pointer"
        >
          <option value="">All Genres</option>
          {GENRES.map((genre) => (
            <option key={genre.value} value={genre.value}>
              {genre.label}
            </option>
          ))}
        </select>
      )}

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1 text-sm text-cinema-text-secondary hover:text-cinema-text transition-colors"
        >
          <X className="w-4 h-4" />
          Clear
        </button>
      )}
    </div>
  );
}
