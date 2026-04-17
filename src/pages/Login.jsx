import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/app';
import { isSupabaseConfigured } from '../lib/supabase';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signIn, user } = useAuthStore();

  useEffect(() => {
    if (user) {
      navigate('/admin');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-cinema-card to-cinema-dark p-4">
        <div className="w-full max-w-md text-center">
          <div className="glass rounded-2xl p-8">
            <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Configuration Required</h1>
            <p className="text-cinema-text-secondary mb-4">
              Please configure your Supabase environment variables to use the admin features.
            </p>
            <p className="text-sm text-cinema-text-secondary">
              Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.
            </p>
            <Link to="/" className="btn-secondary mt-6 inline-block">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-cinema-card to-cinema-dark p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Film className="w-10 h-10 text-cinema-accent" />
            <span className="text-2xl font-bold text-gradient">OnloopVerse</span>
          </Link>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-cinema-text-secondary mt-2">Sign in to your admin account</p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-8">
          {error && (
            <div className="flex items-center gap-2 p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cinema-text-secondary" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  className="input-field pl-12"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cinema-text-secondary" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="input-field pl-12"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>

        <p className="text-center text-cinema-text-secondary text-sm mt-6">
          <Link to="/" className="text-cinema-accent hover:text-cinema-accent-hover">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
