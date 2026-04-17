import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import { MovieCard } from '../components/movie/MovieCard';
import { HorizontalScroll } from '../components/ui/HorizontalScroll';
import { SectionSkeleton } from '../components/ui/Skeleton';
import { tmdbApi, getMoviesByLanguage } from '../lib/tmdb';
import { INDUSTRY_SLUGS } from '../lib/constants';

const INDUSTRIES = [
  { code: 'ta', name: 'Tamil', color: 'from-red-500 to-orange-500' },
  { code: 'te', name: 'Telugu', color: 'from-blue-500 to-cyan-500' },
  { code: 'ml', name: 'Malayalam', color: 'from-green-500 to-emerald-500' },
  { code: 'hi', name: 'Hindi', color: 'from-purple-500 to-pink-500' },
];

export function Home() {
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [tamilMovies, setTamilMovies] = useState([]);
  const [teluguMovies, setTeluguMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
        if (!API_KEY) {
          setLoading(false);
          return;
        }

        const [trending, tamil, telugu, malayalam, hindi] = await Promise.all([
          tmdbApi.getTrendingMovies('week'),
          getMoviesByLanguage('ta', 1),
          getMoviesByLanguage('te', 1),
          getMoviesByLanguage('ml', 1),
          getMoviesByLanguage('hi', 1),
        ]);

        setTrendingMovies(trending.results?.slice(0, 10) || []);
        setFeaturedMovies(trending.results?.slice(0, 5) || []);
        setTamilMovies(tamil.results || []);
        setTeluguMovies(telugu.results || []);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching home data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-12 pb-12">
        <SectionSkeleton count={5} />
        <SectionSkeleton count={6} />
        <SectionSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="pb-12">
      {featuredMovies.length > 0 && (
        <section className="relative mb-12">
          <div className="relative aspect-[21/9] overflow-hidden">
            <img
              src={`https://image.tmdb.org/t/p/original${featuredMovies[0].backdrop_path}`}
              alt={featuredMovies[0].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cinema-dark via-cinema-dark/40 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div className="max-w-7xl mx-auto">
              <span className="inline-block px-3 py-1 bg-cinema-accent/20 text-cinema-accent rounded-full text-sm font-medium mb-4">
                Featured Movie
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {featuredMovies[0].title}
              </h1>
              <p className="text-cinema-text-secondary max-w-2xl mb-6 line-clamp-2">
                {featuredMovies[0].overview}
              </p>
              <div className="flex items-center gap-4">
                <Link
                  to={`/movie/${featuredMovies[0].id}`}
                  className="btn-primary flex items-center gap-2"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Watch Details
                </Link>
                <Link
                  to={`/movie/${featuredMovies[0].id}`}
                  className="btn-secondary"
                >
                  Read More
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {trendingMovies.length > 0 && (
          <HorizontalScroll
            title="Trending This Week"
            items={trendingMovies}
            type="movie"
            viewAllLink="/movies"
          />
        )}

        {tamilMovies.length > 0 && (
          <HorizontalScroll
            title="Tamil Cinema"
            items={tamilMovies}
            type="movie"
            viewAllLink="/discover?industry=tamil"
          />
        )}

        {teluguMovies.length > 0 && (
          <HorizontalScroll
            title="Telugu Cinema"
            items={teluguMovies}
            type="movie"
            viewAllLink="/discover?industry=telugu"
          />
        )}

        <section className="py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-title">Explore by Industry</h2>
            <Link
              to="/discover"
              className="flex items-center gap-1 text-cinema-accent hover:text-cinema-accent-hover transition-colors"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {INDUSTRIES.map((industry) => (
              <Link
                key={industry.code}
                to={`/discover?industry=${industry.code}`}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${industry.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{industry.name}</span>
                </div>
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ArrowRight className="w-8 h-8 text-white" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="py-12">
          <h2 className="section-title mb-8">Discover Themes</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { title: 'Based on Real Events', icon: '📚', query: 'based on true story' },
              { title: 'Award Winners', icon: '🏆', query: 'award winning' },
              { title: 'Blockbusters', icon: '🎬', query: 'blockbuster' },
              { title: 'Biographical', icon: '👤', query: 'biopic' },
            ].map((theme) => (
              <Link
                key={theme.title}
                to={`/search?q=${encodeURIComponent(theme.query)}`}
                className="group p-6 bg-cinema-card rounded-2xl hover:bg-cinema-card-hover transition-colors"
              >
                <span className="text-3xl mb-3 block">{theme.icon}</span>
                <h3 className="font-medium text-cinema-text group-hover:text-cinema-accent transition-colors">
                  {theme.title}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
