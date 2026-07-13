"use client";
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import {
  Gauge,
  TrendingUp,
  Clock,
  CarFront,
  DollarSign
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

function currency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
}

export default function Analytics() {
  const supabase = createClient();
  const { data: jobs = [], isLoading: loadingJobs } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('Job').select('*');
      if (error) throw error;
      return data;
    }
  });

  const { data: invoices = [], isLoading: loadingInvoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await supabase.from('Invoice').select('*');
      if (error) throw error;
      return data;
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

  // Real monthly revenue from paid invoices, trailing 6 months
  const now = new Date();
  const revenueData = Array.from({ length: 6 }, (_, i) => {
    const month = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const revenue = paidInvoices
      .filter((inv: any) => {
        const d = new Date(inv.updatedAt || inv.createdAt);
        return d.getFullYear() === month.getFullYear() && d.getMonth() === month.getMonth();
      })
      .reduce((sum: number, inv: any) => sum + ((inv.subtotal || 0) - (inv.discount || 0)), 0);
    return { name: month.toLocaleString('en-US', { month: 'short' }), revenue };
  });

  // Real average cycle time (createdAt -> updatedAt) per insurer for finished jobs
  const finishedJobs = jobs.filter((j: any) => j.status === 'Ready' || j.status === 'Completed' || j.stage === 100);
  const cycleByInsurer = new Map<string, { totalDays: number, count: number }>();
  finishedJobs.forEach((j: any) => {
    const insurer = j.insurer || 'Customer Pay';
    const days = (new Date(j.updatedAt).getTime() - new Date(j.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    const entry = cycleByInsurer.get(insurer) || { totalDays: 0, count: 0 };
    entry.totalDays += days;
    entry.count += 1;
    cycleByInsurer.set(insurer, entry);
  });
  const cycleTimeData = Array.from(cycleByInsurer.entries()).map(([name, { totalDays, count }]) => ({
    name,
    days: Math.round((totalDays / count) * 10) / 10
  }));

  // Week-over-week change in new jobs, for the WIP trend badge
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const jobsThisWeek = jobs.filter((j: any) => now.getTime() - new Date(j.createdAt).getTime() < weekMs).length;
  const jobsLastWeek = jobs.filter((j: any) => {
    const age = now.getTime() - new Date(j.createdAt).getTime();
    return age >= weekMs && age < 2 * weekMs;
  }).length;
  const wipTrend = jobsLastWeek > 0 ? Math.round(((jobsThisWeek - jobsLastWeek) / jobsLastWeek) * 100) : null;

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
            {wipTrend !== null && (
              <span className={`flex items-center gap-1 text-sm font-medium ${wipTrend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                <TrendingUp size={14} className={wipTrend < 0 ? 'rotate-180' : ''} /> {wipTrend >= 0 ? '+' : ''}{wipTrend}%
              </span>
            )}
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
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 h-96 flex flex-col">
          <div className="mb-6">
            <h3 className="text-zinc-50 font-bold font-['Outfit'] text-lg">Revenue over time</h3>
            <p className="text-zinc-500 text-sm">Monthly paid invoices (trailing 6 months)</p>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }}
                  itemStyle={{ color: '#f4f4f5' }}
                  formatter={(value) => [currency(Number(value)), 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 h-96 flex flex-col">
          <div className="mb-6">
            <h3 className="text-zinc-50 font-bold font-['Outfit'] text-lg">Cycle Time by Insurance</h3>
            <p className="text-zinc-500 text-sm">Average days from drop-off to completion</p>
          </div>
          <div className="flex-1 w-full">
            {cycleTimeData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-600 text-sm">
                No completed jobs yet — cycle times will appear once jobs are finished.
              </div>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cycleTimeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                <XAxis type="number" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} width={100} />
                <Tooltip 
                  cursor={{ fill: '#27272a' }}
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }}
                  itemStyle={{ color: '#f4f4f5' }}
                  formatter={(value) => [`${value} days`, 'Avg. Cycle Time']}
                />
                <Bar dataKey="days" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
