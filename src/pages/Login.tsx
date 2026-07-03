import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { CarFront, LockKeyhole, ArrowLeft } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', {
        email,
        password
      });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="absolute top-6 left-6">
        <Link to="/" className="flex items-center gap-2 text-zinc-400 hover:text-zinc-50 transition-colors">
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-brand-500 text-zinc-50 flex items-center justify-center mb-4">
            <CarFront size={28} />
          </div>
          <h1 className="text-2xl font-bold text-zinc-50 mb-1">InGarage OS</h1>
          <p className="text-zinc-400 text-sm">
            Sign in to your workspace
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-zinc-400">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-zinc-50 px-3 py-2 rounded-lg focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-400">Password</span>
              <Link to="/forgot-password" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-zinc-50 px-3 py-2 rounded-lg focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full bg-brand-500 hover:bg-brand-600 text-zinc-50 font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Processing...' : (
              <>
                <LockKeyhole size={18} />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-zinc-400">
          Need to register your shop?
          <Link
            to="/register"
            className="ml-2 text-brand-400 hover:text-brand-300 transition-colors"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
