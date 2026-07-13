"use client";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getActiveTenantId } from '@/utils/tenant';
import { InvoiceModal } from '@/components/InvoiceModal';
import { calculateSellingPrice } from '@/utils/pricing';
import {
  ReceiptText,
  Search,
  Plus,
  FileText,
  Download,
  CreditCard,
  Share2,
  X,
  Mail
} from 'lucide-react';

function currency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

export default function Invoices() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [printOnOpen, setPrintOnOpen] = useState(false);
  const [formData, setFormData] = useState({
    jobId: '',
    discount: 0,
    taxRate: 0
  });

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await supabase.from('Invoice').select('*, job:Job(*, parts:Part(*), timeLogs:TimeLog(*))');
      if (error) throw error;
      return data;
    }
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('Job').select('*');
      if (error) throw error;
      return data;
    }
  });

  const mutation = useMutation({
    mutationFn: async (newInvoice: any) => {
      // Calculate subtotal from parts and labor
      const { data: job } = await supabase
        .from('Job')
        .select('laborHours, laborRate, parts:Part(cost)')
        .eq('id', newInvoice.jobId)
        .single();
        
      let subtotal = 0;
      if (job) {
        // Parts are billed at the marked-up selling price, matching the estimate and invoice document
        const partsTotal = (job.parts || []).reduce((sum: number, p: any) => sum + calculateSellingPrice(p.cost || 0), 0);
        const laborTotal = (job.laborHours || 0) * (job.laborRate || 0);
        subtotal = partsTotal + laborTotal;
      }

      const now = new Date().toISOString();
      const activeTenantId = getActiveTenantId(user);
      const taxRate = Number(newInvoice.taxRate) || 0;
      const tax = Math.max(0, (subtotal - newInvoice.discount)) * (taxRate / 100);

      const { data, error } = await supabase.from('Invoice').insert([{
        id: crypto.randomUUID(),
        tenantId: activeTenantId,
        createdAt: now,
        updatedAt: now,
        jobId: newInvoice.jobId,
        discount: newInvoice.discount,
        subtotal,
        taxRate,
        tax: Math.round(tax * 100) / 100,
        status: 'Draft'
      }]).select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setIsModalOpen(false);
      setFormData({ jobId: '', discount: 0, taxRate: 0 });
    },
    onError: (err: any) => {
      console.error("Database Insert Error:", err);
    }
  });

  const invoiceTotal = (inv: any) =>
    Math.max(0, (inv.subtotal || 0) - (inv.discount || 0)) + (inv.tax || 0);

  const collectMutation = useMutation({
    mutationFn: async (inv: any) => {
      const { error } = await supabase
        .from('Invoice')
        .update({
          status: 'Paid',
          paid: invoiceTotal(inv),
          updatedAt: new Date().toISOString()
        })
        .eq('id', inv.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
    onError: (err: any) => {
      alert('Failed to record payment: ' + (err.message || 'Unknown error'));
    }
  });

  const handleCollect = (inv: any) => {
    if (window.confirm(`Record ${currency(invoiceTotal(inv))} as paid for invoice #${inv.id.slice(-6).toUpperCase()}?`)) {
      collectMutation.mutate(inv);
    }
  };

  const shareMutation = useMutation({
    mutationFn: async (inv: any) => {
      if (inv.status === 'Draft') {
        const { error } = await supabase
          .from('Invoice')
          .update({ status: 'Sent', updatedAt: new Date().toISOString() })
          .eq('id', inv.id);
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] })
  });

  const handleShare = (inv: any) => {
    const url = `${window.location.origin}/invoice/${inv.id}`;
    navigator.clipboard.writeText(url);
    shareMutation.mutate(inv);
    alert('Invoice link copied to clipboard! Send it to the customer to view and reference their bill.');
  };

  const emailMutation = useMutation({
    mutationFn: async (inv: any) => {
      const email = inv.job?.email || prompt('Enter customer email to send invoice:');
      if (!email) throw new Error('Email is required');

      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: JSON.stringify({
          type: 'invoice',
          id: inv.id,
          customerEmail: email,
          customerName: inv.job?.customer,
          vehicle: inv.job?.vehicle
        })
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to send email');
      }

      if (inv.status === 'Draft') {
        await supabase.from('Invoice').update({ status: 'Sent' }).eq('id', inv.id);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      alert('Email sent successfully!');
    },
    onError: (err: any) => {
      alert(err.message || 'Failed to send email');
    }
  });

  const handleEmail = (inv: any) => {
    emailMutation.mutate(inv);
  };

  const [searchTerm, setSearchTerm] = useState('');

  const filteredInvoices = invoices.filter((i: any) => 
    i.job?.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.job?.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      jobId: formData.jobId,
      discount: Number(formData.discount),
      taxRate: Number(formData.taxRate)
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 relative">
      <header className="flex justify-between items-center bg-zinc-900 border-b border-zinc-800 pb-4">
        <div>
          <p className="text-brand-500 text-sm font-semibold uppercase tracking-wider mb-1">Billing</p>
          <h1 className="text-2xl font-bold text-zinc-50 flex items-center gap-2">
            <ReceiptText size={24} className="text-zinc-400" />
            Invoices
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by customer..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-zinc-50 pl-10 pr-4 py-2 rounded-lg focus:border-brand-500 focus:outline-none w-64"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-zinc-50 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus size={18} />
            Draft Invoice
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="flex justify-center p-12 text-zinc-400">Loading invoices...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredInvoices.length === 0 ? (
            <div className="col-span-full p-12 text-center text-slate-400 bg-zinc-900 border border-zinc-800 rounded-2xl">
              No invoices generated yet.
            </div>
          ) : (
            filteredInvoices.map((inv: any) => (
              <div key={inv.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col hover:border-surface-600 transition-colors">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-50">{currency(invoiceTotal(inv))}</h3>
                    <p className="text-zinc-400 text-sm">#{inv.id.slice(-6).toUpperCase()}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md border text-xs font-semibold ${
                    inv.status === 'Paid' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                    inv.status === 'Sent' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                    'bg-zinc-900/50 border-slate-300 text-zinc-400'
                  }`}>
                    {inv.status}
                  </span>
                </div>

                <div className="space-y-3 mb-6 flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Customer</span>
                    <span className="text-zinc-300">{inv.job?.customer}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Vehicle</span>
                    <span className="text-zinc-300">{inv.job?.vehicle}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Date</span>
                    <span className="text-zinc-300">{new Date(inv.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-4 flex gap-2">
                  <button
                    onClick={() => { setPrintOnOpen(false); setSelectedInvoice(inv); }}
                    className="flex-1 flex items-center justify-center gap-2 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <FileText size={16} /> View
                  </button>
                  <button
                    onClick={() => { setPrintOnOpen(true); setSelectedInvoice(inv); }}
                    title="Download as PDF"
                    className="flex items-center justify-center bg-zinc-900/50 hover:bg-zinc-800 text-zinc-50 px-3 py-2 rounded-lg transition-colors"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={() => handleShare(inv)}
                    title="Copy customer link (marks invoice as Sent)"
                    className="flex items-center justify-center bg-zinc-900/50 hover:bg-zinc-800 text-zinc-50 px-3 py-2 rounded-lg transition-colors"
                  >
                    <Share2 size={16} />
                  </button>
                  <button
                    onClick={() => handleEmail(inv)}
                    title="Email Invoice"
                    disabled={emailMutation.isPending && emailMutation.variables?.id === inv.id}
                    className="flex items-center justify-center bg-zinc-900/50 hover:bg-zinc-800 text-zinc-50 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Mail size={16} />
                  </button>
                  {inv.status !== 'Paid' && (
                    <button
                      onClick={() => handleCollect(inv)}
                      disabled={collectMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-zinc-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      <CreditCard size={16} /> {collectMutation.isPending ? 'Saving...' : 'Collect'}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-zinc-50">Draft Invoice</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-50">
                <X size={20} />
              </button>
            </div>

            {mutation.isError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
                {(mutation.error as any)?.message || 'Failed to draft invoice.'}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Select Completed Job</label>
                <select 
                  required
                  value={formData.jobId}
                  onChange={(e) => setFormData({...formData, jobId: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-50 px-4 py-2 rounded-lg focus:border-brand-500 focus:outline-none"
                >
                  <option value="">-- Choose a Job --</option>
                  {jobs.map((job: any) => (
                    <option key={job.id} value={job.id}>{job.vehicle} - {job.customer}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-2">
                  Selecting a job will automatically calculate the final subtotal based on logged labor hours and assigned parts.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Discount ($) - Optional</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discount}
                    onChange={(e) => setFormData({...formData, discount: Number(e.target.value)})}
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-50 px-4 py-2 rounded-lg focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Sales Tax (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.taxRate}
                    onChange={(e) => setFormData({...formData, taxRate: Number(e.target.value)})}
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-50 px-4 py-2 rounded-lg focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-zinc-900/50 text-zinc-50 rounded-lg hover:bg-zinc-900/50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={mutation.isPending}
                  className="flex-1 px-4 py-2 bg-brand-500 text-zinc-50 rounded-lg hover:bg-brand-600 transition-colors font-medium disabled:opacity-50"
                >
                  {mutation.isPending ? 'Drafting...' : 'Draft Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          autoPrint={printOnOpen}
          onClose={() => { setSelectedInvoice(null); setPrintOnOpen(false); }}
        />
      )}
    </div>
  );
}
