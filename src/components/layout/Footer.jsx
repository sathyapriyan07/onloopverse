import { Link } from 'react-router-dom';
import { Film, Twitter, Github, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-cinema-card/50 border-t border-cinema-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Film className="w-8 h-8 text-cinema-accent" />
              <span className="text-xl font-bold text-gradient">OnloopVerse</span>
            </Link>
            <p className="text-cinema-text-secondary max-w-md">
              Your gateway to regional Indian cinema. Discover movies from Tamil, Telugu, 
              Malayalam, Hindi, and more with rich contextual information.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Industries</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/discover?industry=tamil" className="text-cinema-text-secondary hover:text-cinema-accent transition-colors">
                  Tamil Cinema
                </Link>
              </li>
              <li>
                <Link to="/discover?industry=telugu" className="text-cinema-text-secondary hover:text-cinema-accent transition-colors">
                  Telugu Cinema
                </Link>
              </li>
              <li>
                <Link to="/discover?industry=malayalam" className="text-cinema-text-secondary hover:text-cinema-accent transition-colors">
                  Malayalam Cinema
                </Link>
              </li>
              <li>
                <Link to="/discover?industry=hindi" className="text-cinema-text-secondary hover:text-cinema-accent transition-colors">
                  Bollywood
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Explore</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/movies" className="text-cinema-text-secondary hover:text-cinema-accent transition-colors">
                  All Movies
                </Link>
              </li>
              <li>
                <Link to="/discover" className="text-cinema-text-secondary hover:text-cinema-accent transition-colors">
                  Discover
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-cinema-text-secondary hover:text-cinema-accent transition-colors">
                  Search
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-cinema-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-cinema-text-secondary text-sm">
            © {new Date().getFullYear()} OnloopVerse. Built with React & Supabase.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-cinema-text-secondary hover:text-cinema-accent transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-cinema-text-secondary hover:text-cinema-accent transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" className="text-cinema-text-secondary hover:text-cinema-accent transition-colors">
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
