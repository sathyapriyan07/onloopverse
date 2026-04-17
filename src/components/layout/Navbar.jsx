import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, User, LogOut, Settings, Film } from 'lucide-react';
import { cn } from '../../lib/helpers';
import { useAuthStore } from '../../store/app';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuthStore();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchFocused(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <Film className="w-8 h-8 text-cinema-accent" />
              <span className="text-xl font-bold text-gradient">OnloopVerse</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link to="/movies" className="text-cinema-text-secondary hover:text-cinema-text transition-colors">
                Movies
              </Link>
              <Link to="/discover" className="text-cinema-text-secondary hover:text-cinema-text transition-colors">
                Discover
              </Link>
              <Link to="/search" className="text-cinema-text-secondary hover:text-cinema-text transition-colors">
                Search
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className={cn(
              "hidden sm:flex items-center transition-all duration-300",
              isSearchFocused && "w-80"
            )}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cinema-text-secondary" />
                <input
                  type="text"
                  placeholder="Search movies, people..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-64 bg-cinema-card/50 border border-transparent rounded-full py-2 pl-10 pr-4 text-sm text-cinema-text placeholder:text-cinema-text-secondary focus:outline-none focus:border-cinema-accent transition-all"
                />
              </div>
            </form>

            {user ? (
              <div className="relative group/user">
                <button className="flex items-center gap-2 p-2 rounded-full hover:bg-white/10 transition-colors">
                  <User className="w-5 h-5" />
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 py-2 glass rounded-xl shadow-xl opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all">
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/10 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/10 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="btn-secondary text-sm py-2 px-4">
                Sign in
              </Link>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden glass-dark border-t border-cinema-border">
          <div className="px-4 py-4 space-y-3">
            <form onSubmit={handleSearch} className="sm:hidden">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cinema-text-secondary" />
                <input
                  type="text"
                  placeholder="Search movies, people..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-cinema-card border border-cinema-border rounded-full py-2 pl-10 pr-4 text-sm text-cinema-text placeholder:text-cinema-text-secondary focus:outline-none focus:border-cinema-accent"
                />
              </div>
            </form>
            <Link
              to="/movies"
              className="block px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Movies
            </Link>
            <Link
              to="/discover"
              className="block px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Discover
            </Link>
            <Link
              to="/search"
              className="block px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Search
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
