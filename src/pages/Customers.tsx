import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import {
  MessageSquareText,
  Search,
  MessageCircle,
  Phone,
  Mail,
  CarFront
} from 'lucide-react';

export default function Customers() {
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const res = await api.get('/jobs');
      return res.data;
    }
  });

  const [searchTerm, setSearchTerm] = useState('');

  // Extract unique customers from jobs
  const customersMap = new Map();
  jobs.forEach((job: any) => {
    if (!customersMap.has(job.customer)) {
      customersMap.set(job.customer, {
        name: job.customer,
        vehicles: [job.vehicle],
        lastVisit: job.createdAt
      });
    } else {
      const existing = customersMap.get(job.customer);
      if (!existing.vehicles.includes(job.vehicle)) {
        existing.vehicles.push(job.vehicle);
      }
    }
  });

  const customers = Array.from(customersMap.values());

  const filteredCustomers = customers.filter((c: any) => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.vehicles.some((v: string) => v.toLowerCase().includes(searchTerm.toLowerCase()))
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
        </div>
      </header>

      {isLoading ? (
        <div className="flex justify-center p-12 text-zinc-400">Loading customers...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCustomers.length === 0 ? (
            <div className="col-span-full p-12 text-center text-slate-400 bg-zinc-900 border border-zinc-800 rounded-2xl">
              No customers found.
            </div>
          ) : (
            filteredCustomers.map((customer: any, idx: number) => (
              <div key={idx} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col hover:border-surface-600 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-900/50 flex items-center justify-center text-brand-500 font-bold text-lg">
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-zinc-50 leading-tight">{customer.name}</h3>
                      <p className="text-zinc-400 text-sm">Last active: {new Date(customer.lastVisit).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6 flex-1 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                  <div className="flex items-start gap-3">
                    <CarFront size={16} className="text-slate-400 mt-0.5" />
                    <div className="flex flex-wrap gap-2">
                      {customer.vehicles.map((v: string, i: number) => (
                        <span key={i} className="bg-zinc-900/50 text-zinc-400 text-xs px-2 py-1 rounded">
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 bg-zinc-900/50 hover:bg-zinc-900/50 text-zinc-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                    <Phone size={16} /> Call
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 bg-zinc-900/50 hover:bg-zinc-900/50 text-zinc-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                    <Mail size={16} /> Email
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-zinc-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                    <MessageCircle size={16} /> SMS
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
