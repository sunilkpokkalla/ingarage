"use client";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  ReceiptText,
  Search,
  Plus,
  FileText,
  Download,
  CreditCard,
  X
} from 'lucide-react';

function currency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

export default function Invoices() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    jobId: '',
    discount: 0
  });

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const res = await api.get('/invoices');
      return res.data;
    }
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const res = await api.get('/jobs');
      return res.data;
    }
  });

  const mutation = useMutation({
    mutationFn: async (newInvoice: any) => {
      const res = await api.post('/invoices', newInvoice);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setIsModalOpen(false);
      setFormData({ jobId: '', discount: 0 });
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || 'Failed to draft invoice');
    }
  });

  const [searchTerm, setSearchTerm] = useState('');

  const filteredInvoices = invoices.filter((i: any) => 
    i.job?.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.job?.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      jobId: formData.jobId,
      discount: Number(formData.discount)
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
                    <h3 className="text-lg font-bold text-zinc-50">{currency(inv.subtotal - inv.discount)}</h3>
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
                  <button className="flex-1 flex items-center justify-center gap-2 bg-zinc-900/50 hover:bg-zinc-900/50 text-zinc-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                    <FileText size={16} /> View
                  </button>
                  <button className="flex items-center justify-center bg-zinc-900/50 hover:bg-zinc-900/50 text-zinc-50 px-3 py-2 rounded-lg transition-colors">
                    <Download size={16} />
                  </button>
                  {inv.status !== 'Paid' && (
                    <button className="flex-1 flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-zinc-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                      <CreditCard size={16} /> Collect
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
    </div>
  );
}
