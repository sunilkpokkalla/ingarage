import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { X } from 'lucide-react';

interface NewJobModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewJobModal({ isOpen, onClose }: NewJobModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    vehicle: '',
    customer: '',
    vin: '',
    insurer: '',
    status: 'Intake'
  });

  const mutation = useMutation({
    mutationFn: async (newJob: any) => {
      const res = await api.post('/jobs', newJob);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      onClose();
      setFormData({ vehicle: '', customer: '', vin: '', insurer: '', status: 'Intake' });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-zinc-50">Create New Job</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-50">
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
              onClick={onClose}
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
  );
}
