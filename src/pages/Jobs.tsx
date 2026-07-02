import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import {
  Wrench,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';

export default function Jobs() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    vehicle: '',
    customer: '',
    vin: '',
    insurer: '',
    status: 'Intake'
  });

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const res = await api.get('/jobs');
      return res.data;
    }
  });

  const mutation = useMutation({
    mutationFn: async (newJob: any) => {
      const res = await api.post('/jobs', newJob);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setIsModalOpen(false);
      setFormData({ vehicle: '', customer: '', vin: '', insurer: '', status: 'Intake' });
    }
  });

  const [searchTerm, setSearchTerm] = useState('');

  const filteredJobs = jobs.filter((j: any) => 
    j.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (j.vin && j.vin.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 relative">
      <header className="flex justify-between items-center bg-zinc-900 border-b border-zinc-800 pb-4">
        <div>
          <p className="text-brand-500 text-sm font-semibold uppercase tracking-wider mb-1">Active Vehicles</p>
          <h1 className="text-2xl font-bold text-zinc-50 flex items-center gap-2">
            <Wrench size={24} className="text-zinc-400" />
            Job Board
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by VIN, Customer..." 
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
            New Job
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="flex justify-center p-12 text-zinc-400">Loading jobs...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job: any) => (
            <div key={job.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-surface-600 transition-colors">
              <div className="p-4 border-b border-zinc-800 flex justify-between items-start bg-zinc-900/50/30">
                <div>
                  <h3 className="text-lg font-bold text-zinc-50 mb-1">{job.vehicle}</h3>
                  <p className="text-zinc-400 text-sm">{job.customer}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  job.status === 'Ready' ? 'bg-emerald-500/10 text-emerald-400' :
                  job.status === 'Intake' ? 'bg-brand-500/10 text-brand-400' :
                  'bg-amber-500/10 text-amber-400'
                }`}>
                  {job.status}
                </span>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">VIN</span>
                  <span className="text-zinc-300 font-mono">{job.vin || 'Pending'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Insurance</span>
                  <span className="text-zinc-300">{job.insurer || 'Customer Pay'}</span>
                </div>
                
                <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-400 text-sm">
                    <Clock size={16} /> {job.laborHours}h logged
                  </div>
                  <div className="flex items-center gap-2">
                    {job.stage === 100 ? (
                      <CheckCircle2 size={18} className="text-emerald-500" />
                    ) : (
                      <AlertCircle size={18} className="text-amber-500" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-zinc-50">Create New Job</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-50">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Vehicle Details</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. 2021 Toyota Camry"
                  value={formData.vehicle}
                  onChange={(e) => setFormData({...formData, vehicle: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-50 px-4 py-2 rounded-lg focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Customer Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.customer}
                  onChange={(e) => setFormData({...formData, customer: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-50 px-4 py-2 rounded-lg focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">VIN (Optional)</label>
                <input 
                  type="text" 
                  value={formData.vin}
                  onChange={(e) => setFormData({...formData, vin: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-50 px-4 py-2 rounded-lg focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Insurance Provider</label>
                <input 
                  type="text" 
                  placeholder="e.g. State Farm, Geico"
                  value={formData.insurer}
                  onChange={(e) => setFormData({...formData, insurer: e.target.value})}
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
                  {mutation.isPending ? 'Saving...' : 'Create Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
