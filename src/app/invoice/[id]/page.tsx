"use client";
import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import { calculateSellingPrice } from '@/utils/pricing';
import { CarFront, AlertCircle, CheckCircle2 } from 'lucide-react';

export const runtime = 'edge';

function currency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value || 0);
}

// Customer-facing invoice view, reached via the share link. Reads through a
// security-definer RPC so no table access is exposed to anonymous visitors.
export default function PublicInvoicePage() {
  const params = useParams();
  const invoiceId = typeof params?.id === 'string' ? params.id : '';
  const supabase = createClient();

  const { data: invoice, isLoading, error } = useQuery({
    queryKey: ['publicInvoice', invoiceId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_public_invoice', { p_invoice_id: invoiceId });
      if (error) throw error;
      return data;
    },
    enabled: !!invoiceId
  });

  if (isLoading || !invoiceId) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">Loading invoice...</div>;
  }

  if (error || !invoice) {
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

  const job = invoice.job || {};
  const parts = invoice.parts || [];
  const laborTotal = (job.laborHours || 0) * (job.laborRate || 0);
  const total = Math.max(0, (invoice.subtotal || 0) - (invoice.discount || 0)) + (invoice.tax || 0);
  const balance = Math.max(0, total - (invoice.paid || 0));
  const isPaid = invoice.status === 'Paid' || balance <= 0;

  return (
    <div className="min-h-screen bg-zinc-950 py-12 px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-600 text-white flex items-center justify-center">
            <CarFront size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-50">{invoice.tenantName}</h1>
            <p className="text-sm text-zinc-400">Invoice #{invoice.id.slice(-6).toUpperCase()} · {new Date(invoice.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="ml-auto">
            {isPaid ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 size={14} /> Paid
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
                Balance Due
              </span>
            )}
          </div>
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Billed To</h2>
          <p className="text-lg font-semibold text-zinc-50">{job.customer}</p>
          <p className="text-zinc-400">{job.vehicle}{job.vin ? ` · VIN ${job.vin}` : ''}</p>
        </div>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-300">Charges</h2>
          </div>
          <div className="p-5 space-y-4">
            {parts.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-zinc-500 mb-2">PARTS</h3>
                {parts.map((p: any) => (
                  <div key={p.id} className="flex justify-between text-sm mb-2">
                    <span className="text-zinc-300">{p.name}</span>
                    <span className="text-zinc-400">{currency(calculateSellingPrice(p.cost))}</span>
                  </div>
                ))}
              </div>
            )}
            {(job.laborHours || 0) > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-zinc-500 mb-2">LABOR</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-300">Standard Labor ({job.laborHours} hrs)</span>
                  <span className="text-zinc-400">{currency(laborTotal)}</span>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-zinc-800 space-y-2">
              <div className="flex justify-between text-sm text-zinc-400">
                <span>Subtotal</span>
                <span>{currency(invoice.subtotal)}</span>
              </div>
              {(invoice.discount || 0) > 0 && (
                <div className="flex justify-between text-sm text-emerald-400">
                  <span>Discount</span>
                  <span>-{currency(invoice.discount)}</span>
                </div>
              )}
              {(invoice.tax || 0) > 0 && (
                <div className="flex justify-between text-sm text-zinc-400">
                  <span>Sales Tax{invoice.taxRate ? ` (${invoice.taxRate}%)` : ''}</span>
                  <span>{currency(invoice.tax)}</span>
                </div>
              )}
              {(invoice.paid || 0) > 0 && (
                <div className="flex justify-between text-sm text-emerald-400">
                  <span>Paid</span>
                  <span>-{currency(invoice.paid)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-zinc-800">
                <span className="font-bold text-zinc-300">{isPaid ? 'Total' : 'Balance Due'}</span>
                <span className="text-2xl font-bold text-brand-400">{currency(isPaid ? total : balance)}</span>
              </div>
            </div>
          </div>
        </div>

        {!isPaid && (
          <p className="text-xs text-center text-zinc-500 px-4">
            Please contact {invoice.tenantName} to arrange payment. Payments are accepted in person or by phone.
          </p>
        )}
      </div>
    </div>
  );
}
