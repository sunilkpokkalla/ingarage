import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import {
  Gauge,
  TrendingUp,
  Clock,
  CarFront,
  DollarSign
} from 'lucide-react';

function currency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
}

export default function Analytics() {
  const { data: jobs = [], isLoading: loadingJobs } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const res = await api.get('/jobs');
      return res.data;
    }
  });

  const { data: invoices = [], isLoading: loadingInvoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const res = await api.get('/invoices');
      return res.data;
    }
  });

  if (loadingJobs || loadingInvoices) {
    return <div className="p-12 text-zinc-400">Loading analytics...</div>;
  }

  const activeJobsCount = jobs.length;
  const totalLaborHours = jobs.reduce((sum: number, job: any) => sum + job.laborHours, 0);
  
  const paidInvoices = invoices.filter((i: any) => i.status === 'Paid');
  const totalRevenue = paidInvoices.reduce((sum: number, inv: any) => sum + (inv.subtotal - inv.discount), 0);

  const outstandingInvoices = invoices.filter((i: any) => i.status !== 'Paid');
  const outstandingRevenue = outstandingInvoices.reduce((sum: number, inv: any) => sum + (inv.subtotal - inv.discount), 0);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <header className="flex justify-between items-center bg-zinc-900 border-b border-zinc-800 pb-4">
        <div>
          <p className="text-brand-500 text-sm font-semibold uppercase tracking-wider mb-1">Reports</p>
          <h1 className="text-2xl font-bold text-zinc-50 flex items-center gap-2">
            <Gauge size={24} className="text-zinc-400" />
            Shop Analytics
          </h1>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* KPI 1 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <CarFront size={20} />
            </div>
            <span className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
              <TrendingUp size={14} /> +12%
            </span>
          </div>
          <p className="text-zinc-400 text-sm font-medium mb-1">Active WIP Jobs</p>
          <h3 className="text-3xl font-bold text-zinc-50">{activeJobsCount}</h3>
        </div>

        {/* KPI 2 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-zinc-400 text-sm font-medium mb-1">Total Revenue (Paid)</p>
          <h3 className="text-3xl font-bold text-zinc-50">{currency(totalRevenue)}</h3>
        </div>

        {/* KPI 3 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-zinc-400 text-sm font-medium mb-1">Outstanding Receivables</p>
          <h3 className="text-3xl font-bold text-zinc-50">{currency(outstandingRevenue)}</h3>
        </div>

        {/* KPI 4 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center">
              <Clock size={20} />
            </div>
          </div>
          <p className="text-zinc-400 text-sm font-medium mb-1">Total Labor Logged</p>
          <h3 className="text-3xl font-bold text-zinc-50">{totalLaborHours.toFixed(1)} <span className="text-xl text-slate-400 font-normal">hrs</span></h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 h-80 flex items-center justify-center flex-col text-center">
          <Gauge size={48} className="text-surface-700 mb-4" />
          <h3 className="text-zinc-50 font-medium mb-1">Revenue over time</h3>
          <p className="text-slate-400 text-sm max-w-xs">Chart visualization components will appear here in the next update.</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 h-80 flex items-center justify-center flex-col text-center">
          <CarFront size={48} className="text-surface-700 mb-4" />
          <h3 className="text-zinc-50 font-medium mb-1">Cycle Time by Insurance</h3>
          <p className="text-slate-400 text-sm max-w-xs">Chart visualization components will appear here in the next update.</p>
        </div>
      </div>
    </div>
  );
}
