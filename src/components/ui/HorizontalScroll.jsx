import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MovieCard } from '../movie/MovieCard';
import { PersonCard } from '../person/PersonCard';
import { cn } from '../../lib/helpers';

export function HorizontalScroll({ 
  title, 
  items = [], 
  type = 'movie',
  viewAllLink,
  className 
}) {
  const scrollContainer = (e) => {
    const container = e.currentTarget;
    const scrollAmount = container.offsetWidth * 0.8;
    
    if (e.deltaY > 0 || e.button === 0) {
      container.scrollLeft += scrollAmount;
    } else {
      container.scrollLeft -= scrollAmount;
    }
  };

  const scrollLeft = (e) => {
    const container = e.currentTarget.parentElement.querySelector('.scroll-container');
    container.scrollLeft -= container.offsetWidth * 0.8;
  };

  const scrollRight = (e) => {
    const container = e.currentTarget.parentElement.querySelector('.scroll-container');
    container.scrollLeft += container.offsetWidth * 0.8;
  };

  return (
    <div className={cn('', className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">{title}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={scrollLeft}
            className="p-2 rounded-full hover:bg-cinema-card transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-cinema-text" />
          </button>
          <button
            onClick={scrollRight}
            className="p-2 rounded-full hover:bg-cinema-card transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-cinema-text" />
          </button>
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="text-cinema-accent hover:text-cinema-accent-hover text-sm font-medium ml-2"
            >
              View all
            </Link>
          )}
        </div>
      </div>
      
      <div className="relative group/scroll">
        <div
          className="scroll-container flex gap-4 overflow-x-auto hide-scrollbar pb-4"
          onWheel={(e) => scrollContainer(e)}
        >
          {items.map((item) => (
            <div key={item.id} className="flex-shrink-0 w-44">
              {type === 'movie' && <MovieCard movie={item} />}
              {type === 'person' && <PersonCard person={item} />}
            </div>
          ))}
        </div>
        <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-cinema-dark to-transparent pointer-events-none opacity-0 group-hover/scroll:opacity-100 transition-opacity" />
        <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-cinema-dark to-transparent pointer-events-none opacity-0 group-hover/scroll:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}
