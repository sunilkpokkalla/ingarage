"use client";
import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { CarFront, Send, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message || 'If that email exists, a reset link has been sent.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="absolute top-6 left-6">
        <Link href="/login" className="flex items-center gap-2 text-zinc-400 hover:text-zinc-50 transition-colors">
          <ArrowLeft size={20} />
          <span>Back to Sign In</span>
        </Link>
      </div>

      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-brand-500 text-zinc-50 flex items-center justify-center mb-4">
            <CarFront size={28} />
          </div>
          <h1 className="text-2xl font-bold text-zinc-50 mb-1">Forgot password?</h1>
          <p className="text-zinc-400 text-sm text-center">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        {message && (
          <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-sm">
            {message}
          </div>
        )}
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

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full bg-brand-500 hover:bg-brand-600 text-zinc-50 font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Sending...' : (
              <>
                <Send size={18} />
                Send Reset Link
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
