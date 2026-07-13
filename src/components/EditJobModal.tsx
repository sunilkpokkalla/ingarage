import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import { X, AlertCircle, Trash2 } from 'lucide-react';

// Each status implies how far along the repair is (drives progress bars)
export const JOB_STATUSES: { value: string, stage: number }[] = [
  { value: 'Estimate Pending', stage: 0 },
  { value: 'Estimate Declined', stage: 0 },
  { value: 'Intake', stage: 10 },
  { value: 'In Progress', stage: 50 },
  { value: 'Ready', stage: 90 },
  { value: 'Completed', stage: 100 },
];

export default function EditJobModal({ job, isOpen, onClose }: { job: any, isOpen: boolean, onClose: () => void }) {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const [form, setForm] = useState({
    status: 'Intake',
    laborHours: '0',
    laborRate: '0',
    vin: '',
    insurer: ''
  });

  useEffect(() => {
    if (isOpen && job) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        status: job.status || 'Intake',
        laborHours: String(job.laborHours ?? 0),
        laborRate: String(job.laborRate ?? 0),
        vin: job.vin || '',
        insurer: job.insurer || ''
      });
    }
  }, [isOpen, job]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['jobs'] });
    queryClient.invalidateQueries({ queryKey: ['stats'] });
    queryClient.invalidateQueries({ queryKey: ['invoices'] });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const stage = JOB_STATUSES.find(s => s.value === form.status)?.stage ?? job.stage ?? 0;
      const { error } = await supabase
        .from('Job')
        .update({
          status: form.status,
          stage,
          laborHours: Number(form.laborHours) || 0,
          laborRate: Number(form.laborRate) || 0,
          vin: form.vin || null,
          insurer: form.insurer || null,
          updatedAt: new Date().toISOString()
        })
        .eq('id', job.id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      onClose();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      // No cascade rules in the schema, so remove dependents first
      for (const table of ['TimeLog', 'Part', 'Document', 'Invoice']) {
        const { error } = await supabase.from(table).delete().eq('jobId', job.id);
        if (error) throw error;
      }
      const { error } = await supabase.from('Job').delete().eq('id', job.id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      onClose();
    }
  });

  const handleDelete = () => {
    if (window.confirm(`Delete job "${job.vehicle}" and all its parts, time logs, documents, and invoices? This cannot be undone.`)) {
      deleteMutation.mutate();
    }
  };

  if (!isOpen || !job) return null;
  const error = (saveMutation.error || deleteMutation.error) as any;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl my-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-zinc-50">Edit Job</h2>
            <p className="text-zinc-400 text-sm mt-1">{job.vehicle} — {job.customer}</p>
          </div>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-zinc-50">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{error.message || 'Something went wrong.'}</span>
          </div>
        )}

        <form
          onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-50 px-4 py-2 rounded-lg focus:border-brand-500 focus:outline-none"
            >
              {JOB_STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.value}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Labor Hours</label>
              <input
                type="number" min="0" step="0.25"
                value={form.laborHours}
                onChange={(e) => setForm({ ...form, laborHours: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-50 px-4 py-2 rounded-lg focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Labor Rate ($/hr)</label>
              <input
                type="number" min="0" step="1"
                value={form.laborRate}
                onChange={(e) => setForm({ ...form, laborRate: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-50 px-4 py-2 rounded-lg focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">VIN</label>
              <input
                type="text"
                value={form.vin}
                onChange={(e) => setForm({ ...form, vin: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-50 px-4 py-2 rounded-lg focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Insurance</label>
              <input
                type="text"
                placeholder="Customer Pay"
                value={form.insurer}
                onChange={(e) => setForm({ ...form, insurer: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-50 px-4 py-2 rounded-lg focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3 items-center">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              title="Delete job"
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors disabled:opacity-50"
            >
              <Trash2 size={16} />
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </button>
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 text-zinc-50 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="px-4 py-2 bg-brand-500 text-zinc-50 rounded-lg hover:bg-brand-600 transition-colors font-medium disabled:opacity-50"
            >
              {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
