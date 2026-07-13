import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { X, AlertCircle } from 'lucide-react';

interface NewJobModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewJobModal({ isOpen, onClose }: NewJobModalProps) {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    customer: '',
    phone: '',
    email: '',
    year: '',
    make: '',
    model: '',
    vin: '',
    drivetrain: 'FWD',
    licensePlate: '',
    insurer: '',
    status: 'Intake'
  });

  // Fetch Global Car Makes
  const { data: makesData, isLoading: isLoadingMakes } = useQuery<string[]>({
    queryKey: ['vehicleMakes'],
    queryFn: async () => {
      const res = await fetch('https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json');
      const data = await res.json();
      return Array.from(new Set(data.Results.map((item: any) => item.MakeName.toUpperCase()))).sort() as string[];
    },
    staleTime: 1000 * 60 * 60 * 24 // 24 hours
  });

  // Fetch Models for selected Make and Year
  const { data: modelsData, isLoading: isLoadingModels } = useQuery<string[]>({
    queryKey: ['vehicleModels', formData.make, formData.year],
    queryFn: async () => {
      const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${formData.make}/modelyear/${formData.year}?format=json`);
      const data = await res.json();
      return Array.from(new Set(data.Results.map((item: any) => item.Model_Name.toUpperCase()))).sort() as string[];
    },
    enabled: !!formData.make && formData.year.length === 4,
    staleTime: 1000 * 60 * 60 // 1 hour
  });

  const mutation = useMutation({
    mutationFn: async (newJob: any) => {
      const vehicleString = `${newJob.year} ${newJob.make} ${newJob.model}`.trim();
      const now = new Date().toISOString();
      
      // Fallback to the existing database tenant if user session metadata is missing it
      const activeTenantId = user?.tenantId || 'cmr4vjp1q0000aluvn85iirke';

      const { data, error } = await supabase.from('Job').insert([{
        id: crypto.randomUUID(),
        tenantId: activeTenantId,
        createdAt: now,
        updatedAt: now,
        vehicle: vehicleString,
        customer: newJob.customer,
        vin: newJob.vin || null,
        insurer: newJob.insurer || 'Customer Pay',
        status: 'Estimate Pending',
        stage: 0,
        phone: newJob.phone || null,
        email: newJob.email || null,
        year: newJob.year || null,
        make: newJob.make || null,
        model: newJob.model || null,
        drivetrain: newJob.drivetrain || null,
        license_plate: newJob.licensePlate || null
      }]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      onClose();
      setFormData({
        customer: '', phone: '', email: '',
        year: '', make: '', model: '', vin: '', drivetrain: 'FWD', licensePlate: '',
        insurer: '', status: 'Intake'
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-2xl shadow-2xl my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-zinc-50">Create New Job</h2>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-zinc-50">
            <X size={20} />
          </button>
        </div>

        {mutation.isError && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{(mutation.error as any)?.message || 'An error occurred while creating the job.'}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Info Section */}
          <div>
            <h3 className="text-sm font-semibold text-brand-400 mb-3 uppercase tracking-wider">Customer Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-400 mb-1">Customer Name</label>
                <input required type="text" value={formData.customer} onChange={(e) => setFormData({...formData, customer: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-zinc-50 px-4 py-2 rounded-lg focus:border-brand-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Phone Number</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-zinc-50 px-4 py-2 rounded-lg focus:border-brand-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Email Address</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-zinc-50 px-4 py-2 rounded-lg focus:border-brand-500 focus:outline-none" />
              </div>
            </div>
          </div>

          {/* Vehicle Info Section */}
          <div>
            <h3 className="text-sm font-semibold text-brand-400 mb-3 uppercase tracking-wider">Vehicle Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Year</label>
                <input required type="text" placeholder="e.g. 2024" maxLength={4} value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-zinc-50 px-4 py-2 rounded-lg focus:border-brand-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Make</label>
                <input required type="text" list="makes-list" placeholder={isLoadingMakes ? "Loading..." : "e.g. BMW"} value={formData.make} onChange={(e) => setFormData({...formData, make: e.target.value.toUpperCase(), model: ''})} className="w-full bg-zinc-950 border border-zinc-800 text-zinc-50 px-4 py-2 rounded-lg focus:border-brand-500 focus:outline-none" />
                <datalist id="makes-list">
                  {makesData?.map((make: string) => <option key={make} value={make} />)}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Model</label>
                <input required type="text" list="models-list" placeholder={isLoadingModels ? "Loading..." : "e.g. X5"} disabled={!formData.make || formData.year.length !== 4} value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value.toUpperCase()})} className="w-full bg-zinc-950 border border-zinc-800 text-zinc-50 px-4 py-2 rounded-lg focus:border-brand-500 focus:outline-none disabled:opacity-50" />
                <datalist id="models-list">
                  {modelsData?.map((model: string) => <option key={model} value={model} />)}
                </datalist>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-400 mb-1">VIN</label>
                <input required maxLength={17} minLength={17} type="text" placeholder="17-character VIN" value={formData.vin} onChange={(e) => setFormData({...formData, vin: e.target.value.toUpperCase()})} className="w-full bg-zinc-950 border border-zinc-800 text-zinc-50 px-4 py-2 rounded-lg focus:border-brand-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">License Plate</label>
                <input type="text" value={formData.licensePlate} onChange={(e) => setFormData({...formData, licensePlate: e.target.value.toUpperCase()})} className="w-full bg-zinc-950 border border-zinc-800 text-zinc-50 px-4 py-2 rounded-lg focus:border-brand-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Drivetrain</label>
                <select value={formData.drivetrain} onChange={(e) => setFormData({...formData, drivetrain: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-zinc-50 px-4 py-2.5 rounded-lg focus:border-brand-500 focus:outline-none appearance-none">
                  <option value="FWD">FWD (Front-Wheel)</option>
                  <option value="RWD">RWD (Rear-Wheel)</option>
                  <option value="AWD">AWD (All-Wheel)</option>
                  <option value="4WD">4WD (Four-Wheel)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Job Info Section */}
          <div>
            <h3 className="text-sm font-semibold text-brand-400 mb-3 uppercase tracking-wider">Job Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-400 mb-1">Insurance Provider</label>
                <input type="text" placeholder="e.g. State Farm, Geico" value={formData.insurer} onChange={(e) => setFormData({...formData, insurer: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 text-zinc-50 px-4 py-2 rounded-lg focus:border-brand-500 focus:outline-none" />
              </div>
            </div>
          </div>
          
          <div className="pt-6 flex gap-3 border-t border-zinc-800">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-zinc-900/50 text-zinc-50 rounded-lg hover:bg-zinc-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={mutation.isPending} className="flex-1 px-4 py-2.5 bg-brand-500 text-zinc-50 rounded-lg hover:bg-brand-600 transition-colors font-medium disabled:opacity-50">
              {mutation.isPending ? 'Saving...' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
