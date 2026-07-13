"use client";
import React from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, AlertTriangle, XCircle, CheckCircle, ShieldCheck } from 'lucide-react';
import { calculateSellingPrice } from '@/utils/pricing';

function currency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value || 0);
}

export default function EstimateApprovalPage() {
  const params = useParams();
  const jobId = typeof params?.id === 'string' ? params.id : '';
  const queryClient = useQueryClient();
  const supabase = createClient();

  const { data: job, isLoading, error } = useQuery({
    queryKey: ['estimate', jobId],
    queryFn: async () => {
      if (!jobId) return null;
      const { data, error } = await supabase
        .from('Job')
        .select('*, parts:Part(*), timeLogs:TimeLog(*)')
        .eq('id', jobId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!jobId
  });

  const approveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('Job')
        .update({ status: 'Intake' }) // Move to Intake/In Progress
        .eq('id', jobId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimate', jobId] });
    }
  });

  if (isLoading || !jobId) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">Loading your estimate...</div>;
  if (error || !job) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-rose-500">Estimate not found.</div>;

  const parts = job.parts || [];
  const laborHours = job.laborHours || 0;
  const laborRate = job.laborRate || 0;
  const laborTotal = laborHours * laborRate;
  const partsTotal = parts.reduce((sum: number, p: any) => sum + calculateSellingPrice(p.cost || 0), 0);
  const subtotal = partsTotal + laborTotal;
  
  let dviItems: any[] = [];
  try {
    dviItems = typeof job.damages === 'string' ? JSON.parse(job.damages || '[]') : job.damages || [];
  } catch (e) {}

  const isApproved = job.status !== 'Estimate Pending';

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 pb-20">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 p-6 text-center shadow-lg sticky top-0 z-10">
        <h1 className="text-xl font-bold tracking-tight text-zinc-50 mb-1">InGarage Auto Shop</h1>
        <p className="text-zinc-400 text-sm">Official Repair Estimate</p>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6 mt-4">
        
        {/* Customer Info */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Vehicle Details</h2>
          <p className="text-lg font-bold text-zinc-200">{job.vehicle}</p>
          <p className="text-zinc-400 text-sm mt-1">For: {job.customer}</p>
        </div>

        {/* DVI Report */}
        {dviItems.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-300">Digital Inspection Report</h2>
            </div>
            <div className="divide-y divide-zinc-800/50">
              {dviItems.map((item: any, idx: number) => (
                <div key={idx} className="p-4 flex items-start gap-4">
                  <div className="mt-1">
                    {item.status === 'GREEN' && <CheckCircle2 className="text-emerald-500" size={24} />}
                    {item.status === 'YELLOW' && <AlertTriangle className="text-amber-500" size={24} />}
                    {item.status === 'RED' && <XCircle className="text-rose-500" size={24} />}
                    {item.status === 'UNCHECKED' && <div className="w-6 h-6 rounded-full border-2 border-zinc-700" />}
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-200">{item.name}</p>
                    {item.notes && <p className="text-sm text-zinc-400 mt-1">{item.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quote Details */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-300">Quoted Repairs</h2>
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

            {laborHours > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-zinc-500 mb-2">LABOR</h3>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-zinc-300">Standard Labor ({laborHours} hrs)</span>
                  <span className="text-zinc-400">{currency(laborTotal)}</span>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-zinc-800 flex justify-between items-center">
              <span className="font-bold text-zinc-300">Estimated Total</span>
              <span className="text-2xl font-bold text-brand-400">{currency(subtotal)}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8">
          {isApproved ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3">
              <ShieldCheck className="text-emerald-500" size={48} />
              <div>
                <h3 className="text-xl font-bold text-emerald-400">Work Authorized</h3>
                <p className="text-emerald-500/80 mt-1 text-sm">Thank you! We will begin repairs on your vehicle immediately.</p>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => approveMutation.mutate()}
              disabled={approveMutation.isPending}
              className="w-full bg-brand-500 hover:bg-brand-600 text-zinc-50 rounded-2xl p-4 font-bold text-lg shadow-xl shadow-brand-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {approveMutation.isPending ? 'Authorizing...' : (
                <>
                  <CheckCircle size={22} />
                  Approve & Authorize Work
                </>
              )}
            </button>
          )}
          
          {!isApproved && (
            <p className="text-xs text-center text-zinc-500 mt-4 px-4">
              By clicking Approve, you authorize InGarage Auto Shop to perform the repairs listed above.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
