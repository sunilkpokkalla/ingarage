import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import {
  TrendUp,
  Clock,
  Package,
  CreditCard,
  MagnifyingGlass,
  Bell,
  Funnel,
  Check,
  Plus
} from '@phosphor-icons/react';
import NewJobModal from '../components/NewJobModal';

function currency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Dashboard() {
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const res = await api.get('/jobs');
      return res.data;
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await api.get('/stats');
      return res.data;
    }
  });

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeJob = selectedJobId 
    ? jobs.find((j: any) => j.id === selectedJobId) 
    : jobs[0];

  return (
    <div className="flex-1 overflow-y-auto px-8 py-10 space-y-12">
      <header className="flex justify-between items-end border-b border-zinc-800 pb-6">
        <div>
          <p className="text-brand-500 text-xs font-bold uppercase tracking-widest mb-2 font-mono">Command Center</p>
          <h1 className="text-3xl font-bold text-zinc-50 tracking-tight font-['Outfit']">Repair Pipeline</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative group">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-brand-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search VIN or customer..." 
              className="bg-zinc-900/50 border border-zinc-800 text-zinc-100 pl-10 pr-4 py-2.5 rounded-xl focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all text-sm w-64"
            />
          </div>
          <button className="p-2.5 text-zinc-400 hover:text-zinc-50 transition-colors bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700">
            <Bell size={18} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-zinc-950 px-5 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]"
          >
            <Plus size={16} weight="bold" />
            New Intake
          </button>
        </div>
      </header>

      {/* Metrics Row */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-8 divide-x divide-zinc-800/50">
        <MetricCard icon={<TrendUp size={24} weight="duotone" className="text-blue-400" />} title="Active Jobs" value={(stats?.activeJobs || 0).toString()} detail="Currently in shop" />
        <MetricCard icon={<Clock size={24} weight="duotone" className="text-amber-400" />} title="Labor Captured" value={`${stats?.laborCaptured || 0}h`} detail="Auto-costed" />
        <MetricCard icon={<Package size={24} weight="duotone" className="text-purple-400" />} title="Parts in Transit" value={(stats?.partsInTransit || 0).toString()} detail="Awaiting delivery" />
        <MetricCard icon={<CreditCard size={24} weight="duotone" className="text-emerald-400" />} title="Online Payments" value={currency(stats?.revenue || 0)} detail="Last 7 days" />
      </section>

      {/* Main Board */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        {/* Job List */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-zinc-100 font-bold font-['Outfit'] text-xl">
              <Funnel size={20} className="text-brand-500" /> Live Queue
            </div>
            <span className="text-xs text-zinc-500 font-mono">Location: Main</span>
          </div>

          <div className="flex flex-col border-t border-zinc-800/50">
            {isLoading ? (
              <div className="py-8 text-zinc-500 text-center text-sm font-mono">Loading jobs...</div>
            ) : jobs.length === 0 ? (
              <div className="py-12 text-zinc-500 text-center text-sm font-mono">
                Queue empty.
              </div>
            ) : (
              jobs.map((job: any) => (
                <button
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  className={`flex flex-col text-left py-5 border-b border-zinc-800/50 transition-all ${
                    activeJob?.id === job.id 
                      ? 'pl-4 border-l-[3px] border-l-brand-500 bg-zinc-900/20' 
                      : 'hover:bg-zinc-900/10'
                  }`}
                >
                  <div className="flex justify-between w-full mb-1">
                    <strong className={`font-medium truncate pr-2 ${activeJob?.id === job.id ? 'text-brand-400' : 'text-zinc-100'}`}>{job.vehicle}</strong>
                    <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">{job.status}</span>
                  </div>
                  <div className="text-xs text-zinc-500 mb-3">{job.customer}</div>
                  
                  <div className="w-full bg-zinc-900 rounded-full h-1 overflow-hidden">
                    <div className="bg-brand-500 h-full rounded-full" style={{ width: `${job.stage}%` }} />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Active Job Profile */}
        <div className="xl:col-span-8">
          {activeJob ? (
            <div className="flex flex-col h-full">
              <div className="pb-8 border-b border-zinc-800 flex justify-between items-start">
                <div>
                  <p className="text-zinc-500 text-xs font-mono tracking-widest mb-3 uppercase">{activeJob.id.slice(0,8)} <span className="mx-2">·</span> VIN {activeJob.vin || 'PENDING'}</p>
                  <h2 className="text-4xl font-bold text-zinc-50 mb-2 font-['Outfit'] tracking-tight">{activeJob.vehicle}</h2>
                  <p className="text-zinc-400 flex items-center gap-3">
                    <span className="text-zinc-300">{activeJob.customer}</span>
                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                    <span>{activeJob.insurer || 'Customer Pay'}</span>
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="px-3 py-1 bg-brand-500/10 text-brand-400 rounded-md text-xs font-bold uppercase tracking-wider border border-brand-500/20">
                    {activeJob.priority}
                  </span>
                </div>
              </div>

              <div className="py-8 flex-1 flex flex-col gap-10">
                <div>
                  <h3 className="text-xs font-bold tracking-widest uppercase text-zinc-500 mb-6 flex items-center gap-2 font-mono">
                    <Check size={16} className="text-brand-500" /> Damage Assessment
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {activeJob.damages ? JSON.parse(activeJob.damages).map((d: string) => (
                      <div key={d} className="bg-zinc-900 border border-zinc-800 px-4 py-2.5 rounded-xl text-sm text-zinc-300 shadow-sm">
                        {d}
                      </div>
                    )) : (
                      <span className="text-zinc-600 text-sm italic">No damages recorded</span>
                    )}
                  </div>
                </div>

                <div className="mt-auto pt-8 border-t border-zinc-800">
                  <div className="grid grid-cols-3 gap-8">
                    <div className="flex flex-col">
                      <span className="text-xs text-zinc-500 font-mono tracking-widest uppercase mb-2">Total Labor</span>
                      <strong className="text-3xl text-zinc-100 font-['Outfit']">{activeJob.laborHours} <span className="text-lg text-zinc-600">hrs</span></strong>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-zinc-500 font-mono tracking-widest uppercase mb-2">Parts Cost</span>
                      <strong className="text-3xl text-zinc-100 font-mono tracking-tight">{currency(activeJob.partsCost || 0)}</strong>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-zinc-500 font-mono tracking-widest uppercase mb-2">Calculated Total</span>
                      <strong className="text-3xl text-brand-400 font-mono tracking-tight">{currency((activeJob.laborHours * activeJob.laborRate) + (activeJob.partsCost || 0))}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-600 font-mono text-sm border border-zinc-800/50 border-dashed rounded-3xl">
              [ SELECT RECORD TO VIEW PIPELINE DATA ]
            </div>
          )}
        </div>
      </section>
      <NewJobModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

function MetricCard({ icon, title, value, detail }: { icon: React.ReactNode, title: string, value: string, detail: string }) {
  return (
    <div className="flex flex-col gap-3 pl-8 first:pl-0">
      <div className="flex items-center gap-3 text-zinc-400 font-medium text-sm">
        {icon}
        {title}
      </div>
      <div className="flex items-baseline gap-2">
        <strong className="text-4xl font-bold text-zinc-50 font-mono tracking-tight">{value}</strong>
      </div>
      <span className="text-xs text-zinc-600 font-mono">{detail}</span>
    </div>
  );
}
