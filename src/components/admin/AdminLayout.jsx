import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  Film, Users, Award, LayoutDashboard, Settings, 
  LogOut, Menu, X, Plus, Database, Globe 
} from 'lucide-react';
import { useAuthStore } from '../../store/app';
import { cn } from '../../lib/helpers';

const NAV_ITEMS = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/movies', label: 'Movies', icon: Film },
  { path: '/admin/people', label: 'People', icon: Users },
  { path: '/admin/awards', label: 'Awards', icon: Award },
  { path: '/admin/import', label: 'Import Movie', icon: Plus },
];

export function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, isAdmin, loading } = useAuthStore();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cinema-dark">
        <div className="w-8 h-8 border-2 border-cinema-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cinema-dark p-4">
        <div className="text-center max-w-md">
          <div className="glass rounded-2xl p-8">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-cinema-text-secondary mb-4">
              Your account doesn't have admin privileges.
            </p>
            <p className="text-sm text-cinema-text-secondary mb-6">
              Make sure your email ({user?.email}) is added to the admin_users table in Supabase.
            </p>
            <button
              onClick={() => useAuthStore.getState().signOut()}
              className="btn-secondary"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cinema-dark flex">
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-cinema-card border-r border-cinema-border transform transition-transform lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-cinema-border">
            <Link to="/admin" className="flex items-center gap-2">
              <Database className="w-6 h-6 text-cinema-accent" />
              <span className="text-xl font-bold text-gradient">Admin</span>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = item.exact 
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                    isActive
                      ? "bg-cinema-accent text-cinema-dark font-medium"
                      : "text-cinema-text-secondary hover:bg-white/5 hover:text-cinema-text"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-cinema-border">
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-cinema-text-secondary hover:bg-white/5 transition-colors"
            >
              <Globe className="w-5 h-5" />
              View Site
            </Link>
            <button
              onClick={() => useAuthStore.getState().signOut()}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-cinema-text-secondary hover:bg-white/5 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-30 bg-cinema-dark/80 backdrop-blur-xl border-b border-cinema-border">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h1 className="text-xl font-semibold capitalize">
              {location.pathname.replace('/admin', '').replace('/', '') || 'Dashboard'}
            </h1>
            <div className="text-sm text-cinema-text-secondary">
              {user?.email}
            </div>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
