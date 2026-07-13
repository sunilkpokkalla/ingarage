import { X, CheckCircle2, AlertTriangle, XCircle, Search } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const STANDARD_CHECKS = [
  'Brakes & Rotors',
  'Tires & Alignment',
  'Suspension & Steering',
  'Battery & Cables',
  'Engine Oil & Fluids',
  'Filters (Cabin/Engine)',
  'Lights & Wipers',
  'Belts & Hoses',
  'Exhaust System'
];

type InspectionStatus = 'GREEN' | 'YELLOW' | 'RED' | 'UNCHECKED';

interface InspectionItem {
  name: string;
  status: InspectionStatus;
  notes: string;
}

export default function DVIModal({ job, isOpen, onClose }: { job: any, isOpen: boolean, onClose: () => void }) {
  const [items, setItems] = useState<InspectionItem[]>([]);
  const queryClient = useQueryClient();
  const supabase = createClient();

  // Initialize data when modal opens
  useEffect(() => {
    if (isOpen && job) {
      let existingData: InspectionItem[] = [];
      try {
        existingData = typeof job.damages === 'string' ? JSON.parse(job.damages || '[]') : job.damages || [];
      } catch (e) {
        existingData = [];
      }

      // Merge existing data with standard checks so we always show the full list
      const merged: InspectionItem[] = STANDARD_CHECKS.map(checkName => {
        const existing = existingData.find(item => item.name === checkName);
        return existing || { name: checkName, status: 'UNCHECKED' as InspectionStatus, notes: '' };
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setItems(merged);
    }
  }, [isOpen, job]);

  const updateItem = (index: number, updates: Partial<InspectionItem>) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...updates };
    setItems(newItems);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('Job')
        .update({ damages: JSON.stringify(items), updatedAt: new Date().toISOString() })
        .eq('id', job.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      onClose();
    },
    onError: (err: any) => {
      alert('Failed to save inspection: ' + (err.message || 'Unknown error'));
    }
  });

  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center p-4 z-50 overflow-y-auto items-start">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-4xl shadow-2xl relative my-8">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-bold text-zinc-50 flex items-center gap-2">
              <Search className="text-brand-500" />
              Digital Vehicle Inspection
            </h2>
            <p className="text-zinc-400 text-sm mt-1">{job.vehicle} - {job.customer}</p>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          
          <div className="flex justify-between text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-4">
            <span className="w-1/3">System Component</span>
            <span className="w-1/3 text-center">Status Grade</span>
            <span className="w-1/3 text-right">Technician Notes</span>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-4 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50">
                {/* Name */}
                <div className="w-1/3 font-medium text-zinc-200">
                  {item.name}
                </div>

                {/* Grading Buttons */}
                <div className="w-1/3 flex justify-center gap-2">
                  <button 
                    onClick={() => updateItem(idx, { status: 'GREEN' })}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                      item.status === 'GREEN' 
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                        : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                    }`}
                    title="Good Condition"
                  >
                    <CheckCircle2 size={24} />
                  </button>
                  
                  <button 
                    onClick={() => updateItem(idx, { status: 'YELLOW' })}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                      item.status === 'YELLOW' 
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400' 
                        : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                    }`}
                    title="Monitor / Future Repair"
                  >
                    <AlertTriangle size={24} />
                  </button>
                  
                  <button 
                    onClick={() => updateItem(idx, { status: 'RED' })}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                      item.status === 'RED' 
                        ? 'bg-rose-500/20 border-rose-500 text-rose-400' 
                        : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                    }`}
                    title="Action Required"
                  >
                    <XCircle size={24} />
                  </button>
                </div>

                {/* Notes */}
                <div className="w-1/3">
                  <input 
                    type="text" 
                    placeholder="Add inspection notes..."
                    value={item.notes}
                    onChange={(e) => updateItem(idx, { notes: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-50 px-3 py-2 rounded-lg focus:border-brand-500 focus:outline-none text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-900/50 rounded-b-2xl">
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-lg font-medium text-zinc-400 hover:text-zinc-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="bg-brand-500 hover:bg-brand-600 text-zinc-50 px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {saveMutation.isPending ? 'Saving...' : 'Save Inspection Report'}
          </button>
        </div>

      </div>
    </div>
  );
}
