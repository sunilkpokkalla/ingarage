import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { Wrench, LockKeyhole, AlertCircle } from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic client-side validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        tenantName: shopName,
        userName: userName,
        email,
        password
      });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-zinc-50 shadow-lg shadow-brand-500/20">
            <Wrench size={24} strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-zinc-50">InGarage</span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-zinc-50">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-400 hover:text-brand-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-zinc-900 py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-zinc-800">

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Shop Name
              </label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="appearance-none block w-full px-3 py-2.5 border border-zinc-700 bg-zinc-950 rounded-lg text-zinc-50 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-colors"
                placeholder="e.g. Sunrise Body Shop"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Your Name
              </label>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="appearance-none block w-full px-3 py-2.5 border border-zinc-700 bg-zinc-950 rounded-lg text-zinc-50 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-colors"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-3 py-2.5 border border-zinc-700 bg-zinc-950 rounded-lg text-zinc-50 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-3 py-2.5 border border-zinc-700 bg-zinc-950 rounded-lg text-zinc-50 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-colors"
                placeholder="Min. 8 characters"
              />
              <p className="text-xs text-zinc-500 mt-1.5">Must be at least 8 characters long.</p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-zinc-950 bg-brand-500 hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 focus:ring-offset-zinc-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  'Creating account...'
                ) : (
                  <>
                    <LockKeyhole size={16} />
                    Start Free Trial
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-zinc-500">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </div>
        </div>
      </div>
    </div>
  );
}
