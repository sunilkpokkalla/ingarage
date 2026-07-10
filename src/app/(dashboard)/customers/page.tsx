"use client";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import {
  MessageSquareText,
  Search,
  Phone,
  Mail,
  CarFront,
  Plus,
  X
} from 'lucide-react';

interface CustomerForm {
  name: string;
  email: string;
  phone: string;
}

const emptyForm: CustomerForm = { name: '', email: '', phone: '' };

export default function Customers() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase.from('Customer').select('*');
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

  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CustomerForm>(emptyForm);
  const [formError, setFormError] = useState('');

  const createMutation = useMutation({
    mutationFn: async (data: CustomerForm) => {
      const { data: result, error } = await supabase.from('Customer').insert([{
        name: data.name,
        email: data.email || null,
        phone: data.phone || null
      }]).select().single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setForm(emptyForm);
      setShowForm(false);
      setFormError('');
    },
    onError: (err: any) => {
      setFormError(err.message || 'Failed to create customer');
    }
  });

  // Merge: real customer records + legacy names that only exist on jobs
  const dbNames = new Set(customers.map((c: any) => c.name.toLowerCase()));
  const legacyMap = new Map<string, any>();
  jobs.forEach((job: any) => {
    if (dbNames.has(job.customer?.toLowerCase())) return;
    if (!legacyMap.has(job.customer)) {
      legacyMap.set(job.customer, {
        id: `legacy-${job.customer}`,
        name: job.customer,
        email: null,
        phone: null,
        legacy: true,
        jobs: [{ vehicle: job.vehicle }],
        createdAt: job.createdAt
      });
    } else if (!legacyMap.get(job.customer).jobs.some((j: any) => j.vehicle === job.vehicle)) {
      legacyMap.get(job.customer).jobs.push({ vehicle: job.vehicle });
    }
  });

  const allCustomers = [...customers, ...Array.from(legacyMap.values())];

  const filteredCustomers = allCustomers.filter((c: any) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.jobs || []).some((j: any) => j.vehicle?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <header className="flex justify-between items-center bg-zinc-900 border-b border-zinc-800 pb-4">
        <div>
          <p className="text-brand-500 text-sm font-semibold uppercase tracking-wider mb-1">CRM</p>
          <h1 className="text-2xl font-bold text-zinc-50 flex items-center gap-2">
            <MessageSquareText size={24} className="text-zinc-400" />
            Customers
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-zinc-50 pl-10 pr-4 py-2 rounded-lg focus:border-brand-500 focus:outline-none w-64"
            />
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-zinc-50 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus size={18} />
            Add Customer
          </button>
        </div>
      </header>

      {showForm && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-zinc-50">New Customer</h3>
            <button onClick={() => setShowForm(false)} className="text-zinc-400 hover:text-zinc-50">
              <X size={20} />
            </button>
          </div>
          {formError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
              {formError}
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate(form);
            }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <input
              type="text"
              required
              placeholder="Full name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-zinc-950 border border-zinc-800 text-zinc-50 px-3 py-2 rounded-lg focus:border-brand-500 focus:outline-none"
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="bg-zinc-950 border border-zinc-800 text-zinc-50 px-3 py-2 rounded-lg focus:border-brand-500 focus:outline-none"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="bg-zinc-950 border border-zinc-800 text-zinc-50 px-3 py-2 rounded-lg focus:border-brand-500 focus:outline-none"
            />
            <div className="md:col-span-3 flex justify-end">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-brand-500 hover:bg-brand-600 text-zinc-50 px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {createMutation.isPending ? 'Saving...' : 'Save Customer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center p-12 text-zinc-400">Loading customers...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCustomers.length === 0 ? (
            <div className="col-span-full p-12 text-center text-slate-400 bg-zinc-900 border border-zinc-800 rounded-2xl">
              No customers found. Add your first customer to get started.
            </div>
          ) : (
            filteredCustomers.map((customer: any) => (
              <div key={customer.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col hover:border-surface-600 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-900/50 flex items-center justify-center text-brand-500 font-bold text-lg">
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-zinc-50 leading-tight">{customer.name}</h3>
                      <p className="text-zinc-400 text-sm">
                        {customer.legacy
                          ? 'From job records'
                          : customer.email || customer.phone || 'No contact info'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6 flex-1 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                  <div className="flex items-start gap-3">
                    <CarFront size={16} className="text-slate-400 mt-0.5" />
                    <div className="flex flex-wrap gap-2">
                      {(customer.jobs || []).length === 0 ? (
                        <span className="text-zinc-500 text-xs">No jobs yet</span>
                      ) : (
                        (customer.jobs || []).map((j: any, i: number) => (
                          <span key={i} className="bg-zinc-900/50 text-zinc-400 text-xs px-2 py-1 rounded">
                            {j.vehicle}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href={customer.phone ? `tel:${customer.phone}` : undefined}
                    aria-disabled={!customer.phone}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      customer.phone
                        ? 'bg-zinc-900/50 hover:bg-zinc-800 text-zinc-50'
                        : 'bg-zinc-900/30 text-zinc-600 cursor-not-allowed pointer-events-none'
                    }`}
                  >
                    <Phone size={16} /> Call
                  </a>
                  <a
                    href={customer.email ? `mailto:${customer.email}` : undefined}
                    aria-disabled={!customer.email}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      customer.email
                        ? 'bg-brand-500 hover:bg-brand-600 text-zinc-50'
                        : 'bg-zinc-900/30 text-zinc-600 cursor-not-allowed pointer-events-none'
                    }`}
                  >
                    <Mail size={16} /> Email
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
