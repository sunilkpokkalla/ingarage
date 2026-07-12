"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';
import { Wrench, LockKeyhole, AlertCircle } from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const router = useRouter();
  const supabase = createClient();

  const handleResendEmail = async () => {
    setResendStatus('loading');
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    if (error) {
      setResendStatus('error');
    } else {
      setResendStatus('success');
      setTimeout(() => setResendStatus('idle'), 5000); // Reset button after 5s
    }
  };

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
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            tenant_name: shopName,
            full_name: userName,
          }
        }
      });
      
      if (authError) throw authError;
      if (data?.user && data?.session === null) {
        setIsSuccess(true);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      const msg = err.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
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
          <Link href="/login" className="font-medium text-brand-400 hover:text-brand-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>

      {isSuccess ? (
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-zinc-900 py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-zinc-800 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
              <AlertCircle size={24} className="text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-zinc-50">Check your email</h3>
            <p className="text-zinc-400 text-sm">
              We've sent a confirmation link to <span className="font-medium text-zinc-300">{email}</span>. 
              Please click the link in the email to activate your account and sign in.
            </p>
            <div className="pt-4 space-y-3">
              <button
                onClick={handleResendEmail}
                disabled={resendStatus === 'loading' || resendStatus === 'success'}
                className="w-full text-zinc-300 bg-zinc-800 hover:bg-zinc-700 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {resendStatus === 'loading' ? 'Sending...' : 
                 resendStatus === 'success' ? 'Email Sent!' : 
                 'Resend confirmation email'}
              </button>
              {resendStatus === 'error' && (
                <p className="text-red-400 text-xs">Failed to resend. Please try again.</p>
              )}
              <Link href="/login" className="block text-brand-400 hover:text-brand-300 font-medium text-sm transition-colors mt-2">
                Return to sign in
              </Link>
            </div>
          </div>
        </div>
      ) : (
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
      )}
    </div>
  );
}
