import { Construction } from 'lucide-react';

export default function ComingSoon({ title, description }: { title: string, description: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center h-full min-h-[500px]">
      <div className="w-24 h-24 bg-zinc-900/50 rounded-full flex items-center justify-center mb-6 border-4 border-slate-100 shadow-2xl shadow-black/50 ring-1 ring-surface-700">
        <Construction size={48} className="text-brand-500" />
      </div>
      <h1 className="text-3xl font-bold text-zinc-50 mb-3">{title}</h1>
      <p className="text-zinc-400 max-w-md text-lg leading-relaxed">
        {description}
      </p>
      
      <div className="mt-12 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-sm w-full">
        <h3 className="text-sm font-semibold text-zinc-50 uppercase tracking-wider mb-2">Want early access?</h3>
        <p className="text-sm text-slate-400 mb-4">Join the beta waitlist for this module.</p>
        <button className="w-full bg-zinc-900/50 hover:bg-zinc-900/50 text-zinc-50 py-2 rounded-lg font-medium transition-colors border border-slate-300">
          Request Beta Access
        </button>
      </div>
    </div>
  );
}
