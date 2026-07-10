"use client";
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Receipt, CarFront, AlertCircle, CheckCircle2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// The actual payment form component
function CheckoutForm({ onSuccess }: { clientSecret: string, onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // We handle redirection / confirmation via Webhooks mostly, but Stripe requires a return_url
        // For this demo, we'll just redirect to the same page which will re-fetch status
        return_url: window.location.href,
      },
    });

    if (submitError) {
      setError(submitError.message || 'An unexpected error occurred.');
      setIsProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100 flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
      <button 
        disabled={!stripe || isProcessing}
        className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
      >
        {isProcessing ? 'Processing...' : 'Pay Securely'}
      </button>
    </form>
  );
}

export default function PublicInvoice() {
  const { id } = useParams();
  const [stripePromise, setStripePromise] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentError, setPaymentError] = useState('');

  const { data: invoice, isLoading, refetch } = useQuery({
    queryKey: ['publicInvoice', id],
    queryFn: () => fetch(`${API_URL}/public/invoices/${id}`).then(res => res.json())
  });

  const handleInitializePayment = async () => {
    try {
      const res = await fetch(`${API_URL}/public/invoices/${id}/pay`, { method: 'POST' });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      setStripePromise(loadStripe(data.publicKey));
      setClientSecret(data.clientSecret);
    } catch (err: any) {
      setPaymentError(err.message);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-zinc-950">Loading invoice...</div>;

  if (invoice?.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-6">
        <div className="bg-zinc-900 p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-zinc-800">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-zinc-50 mb-2">Invoice Not Found</h1>
          <p className="text-zinc-400">This invoice may have been deleted or the link is invalid.</p>
        </div>
      </div>
    );
  }

  const isPaid = invoice.balance <= 0 || invoice.status === 'Paid';

  return (
    <div className="min-h-screen bg-zinc-950 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-600 text-white flex items-center justify-center">
              <CarFront size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-50">{invoice.tenantName}</h1>
              <p className="text-sm text-zinc-400">Invoice #{invoice.id.slice(-6).toUpperCase()}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-3 space-y-6">
            {/* Invoice Details Card */}
            <div className="bg-zinc-900 p-8 rounded-2xl shadow-sm border border-zinc-800">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-1">Billed To</h2>
                  <p className="text-lg font-semibold text-zinc-50">{invoice.job.customer}</p>
                  <p className="text-zinc-400">{invoice.job.vehicle}</p>
                </div>
                <div className="text-right">
                  <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-1">Amount Due</h2>
                  <p className="text-3xl font-bold text-zinc-50">
                    ${invoice.balance.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <div className="flex justify-between py-2 text-zinc-400">
                  <span>Subtotal</span>
                  <span>${invoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 text-zinc-400">
                  <span>Discount</span>
                  <span>-${invoice.discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 text-emerald-600 font-medium">
                  <span>Already Paid</span>
                  <span>-${invoice.paid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-4 mt-2 border-t border-zinc-800 font-bold text-lg text-zinc-50">
                  <span>Total Balance</span>
                  <span>${invoice.balance.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-zinc-900 p-6 rounded-2xl shadow-xl border border-zinc-800 sticky top-6">
              <div className="flex items-center gap-2 mb-6">
                <Receipt size={20} className="text-brand-600" />
                <h3 className="text-lg font-bold text-zinc-50">Payment</h3>
              </div>

              {isPaid ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="text-xl font-bold text-zinc-50 mb-2">Payment Complete</h4>
                  <p className="text-zinc-400 text-sm">Thank you! This invoice has been fully paid.</p>
                </div>
              ) : (
                <>
                  {!clientSecret && !paymentError && (
                    <button 
                      onClick={handleInitializePayment}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-lg font-medium transition-colors"
                    >
                      Pay Online Now
                    </button>
                  )}

                  {paymentError && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm">
                      {paymentError}
                    </div>
                  )}

                  {clientSecret && stripePromise && (
                    <div className="mt-4">
                      <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                        <CheckoutForm clientSecret={clientSecret} onSuccess={() => refetch()} />
                      </Elements>
                    </div>
                  )}
                </>
              )}
              
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
                <span>Secure payments powered by</span>
                <span className="font-bold text-zinc-400 tracking-wider">STRIPE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
