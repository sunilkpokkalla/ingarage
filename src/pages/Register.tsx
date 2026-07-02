import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { Wrench } from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [userName, setUserName] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      alert(err.response?.data?.error || 'Registration failed');
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
          Or{' '}
          <Link to="/login" className="font-medium text-brand-400 hover:text-brand-300 transition-colors">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-zinc-900 py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-zinc-800">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-zinc-300">
                Shop Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 bg-zinc-950 rounded-lg shadow-sm placeholder-surface-500 text-zinc-50 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-colors"
                  placeholder="e.g. InGarage Auto Body"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300">
                Your Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 bg-zinc-950 rounded-lg shadow-sm placeholder-surface-500 text-zinc-50 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-colors"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300">
                Email address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 bg-zinc-950 rounded-lg shadow-sm placeholder-surface-500 text-zinc-50 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 bg-zinc-950 rounded-lg shadow-sm placeholder-surface-500 text-zinc-50 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 focus:ring-offset-surface-900 transition-colors"
              >
                Start Free Trial
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center text-xs text-slate-400">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </div>
        </div>
      </div>
    </div>
  );
}
