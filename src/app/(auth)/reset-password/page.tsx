"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'react-router-dom';
import { createClient } from '@/utils/supabase/client';
import { CarFront, LockKeyhole } from 'lucide-react';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const isInvite = searchParams.get('invite') === '1';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to set password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-brand-500 text-zinc-50 flex items-center justify-center mb-4">
            <CarFront size={28} />
          </div>
          <h1 className="text-2xl font-bold text-zinc-50 mb-1">
            {isInvite ? 'Welcome to InGarage' : 'Set a new password'}
          </h1>
          <p className="text-zinc-400 text-sm text-center">
            {isInvite
              ? 'Choose a password to activate your account.'
              : 'Choose a new password for your account.'}
          </p>
        </div>

        {!token && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
            This link is missing its token. Please use the link from your email.
          </div>
        )}
        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-zinc-400">New Password</span>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-zinc-50 px-3 py-2 rounded-lg focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-zinc-400">Confirm Password</span>
            <input
              type="password"
              required
              minLength={8}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-zinc-50 px-3 py-2 rounded-lg focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </label>

          <button
            type="submit"
            disabled={loading || !token}
            className="mt-2 w-full bg-brand-500 hover:bg-brand-600 text-zinc-50 font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Saving...' : (
              <>
                <LockKeyhole size={18} />
                {isInvite ? 'Activate Account' : 'Reset Password'}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-zinc-400">
          <Link href="/login" className="text-brand-400 hover:text-brand-300 transition-colors">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
