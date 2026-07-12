"use client";

import { Wrench, CheckCircle, Database, FileText } from 'lucide-react';

export default function Integrations() {
  const integrations = [
    {
      name: "QuickBooks Online",
      description: "Automatically sync invoices, payments, and customers to your QuickBooks account.",
      icon: <FileText size={24} className="text-brand-400" />,
      status: "Connected",
      category: "Accounting"
    },
    {
      name: "ALLDATA",
      description: "Pull in OEM repair procedures and labor times directly into your estimates and jobs.",
      icon: <Wrench size={24} className="text-blue-400" />,
      status: "Available",
      category: "Repair Data"
    },
    {
      name: "Carfax",
      description: "Fetch vehicle history, specs, and maintenance schedules via VIN decoding.",
      icon: <Database size={24} className="text-zinc-400" />,
      status: "Available",
      category: "Vehicle Data"
    },
    {
      name: "Stripe",
      description: "Process credit card payments securely and directly from your customer invoices.",
      icon: <CheckCircle size={24} className="text-indigo-400" />,
      status: "Connected",
      category: "Payments"
    }
  ];

  return (
    <div className="w-full min-h-[100dvh] bg-transparent pt-32 px-6 pb-24 font-sans text-zinc-50 overflow-hidden relative z-10">
      
      {/* Split-Screen Hero */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-950/30 border border-brand-900/50 text-sm font-medium text-brand-500 mb-8">
            <Database size={16} />
            Ecosystem
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 font-serif text-balance leading-tight">
            Connects with everything.
          </h1>
          <p className="text-xl text-zinc-400 max-w-lg leading-relaxed">
            InGarage seamlessly connects with the tools you already use. From accounting to estimating, stop double-entering data and start automating your workflow.
          </p>
        </div>
        <div className="relative w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl border border-zinc-800">
          <img src="/hero.png" alt="Mechanic using tablet" className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700" />
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-900/40 to-transparent mix-blend-multiply pointer-events-none" />
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-zinc-100">Featured Integrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((integration, i) => (
            <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 hover:bg-zinc-900 transition-colors flex items-start gap-6 group">
              <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center flex-shrink-0 group-hover:border-brand-500/50 transition-colors">
                {integration.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-zinc-100 font-['Outfit']">{integration.name}</h3>
                  <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${integration.status === 'Connected' ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'}`}>
                    {integration.status}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 font-mono mb-4 uppercase tracking-widest">{integration.category}</p>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  {integration.description}
                </p>
                <button className="text-sm font-bold text-zinc-100 hover:text-brand-400 transition-colors flex items-center gap-2">
                  {integration.status === 'Connected' ? 'Manage Settings →' : 'Connect Integration →'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
