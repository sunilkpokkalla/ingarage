"use client";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import {
  PackageSearch,
  Search,
  Plus,
  Truck,
  CheckCircle,
  PackageCheck,
  X
} from 'lucide-react';

export default function Parts() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    jobId: '',
    name: '',
    number: '',
    supplier: '',
    cost: '',
    eta: ''
  });

  const { data: parts = [], isLoading } = useQuery({
    queryKey: ['parts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('Part').select('*, job:Job(*)');
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
    mutationFn: async (newPart: any) => {
      const { data, error } = await supabase.from('Part').insert([{
        jobId: newPart.jobId,
        name: newPart.name,
        number: newPart.number || null,
        supplier: newPart.supplier,
        cost: Number(newPart.cost),
        eta: newPart.eta ? new Date(newPart.eta).toISOString() : null,
        status: 'Ordered'
      }]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      setIsModalOpen(false);
      setFormData({ jobId: '', name: '', number: '', supplier: '', cost: '', eta: '' });
    }
  });

  const [searchTerm, setSearchTerm] = useState('');

  const filteredParts = parts.filter((p: any) => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 relative">
      <header className="flex justify-between items-center bg-zinc-900 border-b border-zinc-800 pb-4">
        <div>
          <p className="text-brand-500 text-sm font-semibold uppercase tracking-wider mb-1">Procurement</p>
          <h1 className="text-2xl font-bold text-zinc-50 flex items-center gap-2">
            <PackageSearch size={24} className="text-zinc-400" />
            Parts Management
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Search parts, suppliers..." 
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
            Order Part
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="flex justify-center p-12 text-zinc-400">Loading parts...</div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-zinc-900/50/50 text-zinc-400 uppercase text-xs border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium">Part Details</th>
                <th className="px-6 py-4 font-medium">Job / Vehicle</th>
                <th className="px-6 py-4 font-medium">Supplier</th>
                <th className="px-6 py-4 font-medium">ETA</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800">
              {filteredParts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No parts ordered yet.
                  </td>
                </tr>
              ) : (
                filteredParts.map((part: any) => (
                  <tr key={part.id} className="hover:bg-zinc-900/50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-zinc-50 font-medium">{part.name}</span>
                        <span className="text-xs text-slate-400">PN: {part.number || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {part.job?.vehicle}
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      {part.supplier}
                    </td>
                    <td className="px-6 py-4 font-mono text-zinc-400">
                      {part.eta ? new Date(part.eta).toLocaleDateString() : 'TBD'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                        part.status === 'Ordered' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        part.status === 'InTransit' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        part.status === 'Received' ? 'bg-brand-500/10 text-brand-400 border-brand-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {part.status === 'InTransit' && <Truck size={14} />}
                        {part.status === 'Received' && <PackageCheck size={14} />}
                        {part.status === 'Installed' && <CheckCircle size={14} />}
                        {part.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-zinc-50">Order Part</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-50">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Select Job</label>
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
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Part Name</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Front Bumper Cover"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-50 px-4 py-2 rounded-lg focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Supplier</label>
                  <input 
                    required
                    type="text" 
                    value={formData.supplier}
                    onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-50 px-4 py-2 rounded-lg focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Part Number</label>
                  <input 
                    type="text" 
                    value={formData.number}
                    onChange={(e) => setFormData({...formData, number: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-50 px-4 py-2 rounded-lg focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Cost ($)</label>
                  <input 
                    required
                    type="number" 
                    min="0"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({...formData, cost: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-50 px-4 py-2 rounded-lg focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">ETA Date</label>
                  <input 
                    type="date" 
                    value={formData.eta}
                    onChange={(e) => setFormData({...formData, eta: e.target.value})}
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
                  {mutation.isPending ? 'Ordering...' : 'Order Part'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
