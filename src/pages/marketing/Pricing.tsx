import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Pricing() {
  return (
    <div className="w-full relative py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-zinc-50 tracking-tight mb-6">
            Simple, transparent pricing.
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            No hidden fees. No installation costs. Just powerful software that scales with your shop.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Starter */}
          <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 shadow-sm flex flex-col">
            <h3 className="text-xl font-bold text-zinc-50 mb-2">Starter Shop</h3>
            <p className="text-zinc-400 mb-6 text-sm">Perfect for small, independent shops doing &lt;$1M annually.</p>
            <div className="mb-8">
              <span className="text-4xl font-bold text-zinc-50">$199</span>
              <span className="text-zinc-400">/mo</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-zinc-400">
                <Check size={18} className="text-brand-600" /> Up to 3 Users
              </li>
              <li className="flex items-center gap-3 text-zinc-400">
                <Check size={18} className="text-brand-600" /> Basic Job Board
              </li>
              <li className="flex items-center gap-3 text-zinc-400">
                <Check size={18} className="text-brand-600" /> Estimates & Invoicing
              </li>
            </ul>
            <Link to="/register" className="w-full py-3 px-4 border border-slate-300 rounded-full text-center font-medium text-zinc-300 hover:bg-zinc-950 transition-colors">
              Start Free Trial
            </Link>
          </div>

          {/* Professional */}
          <div className="bg-brand-600 rounded-3xl p-8 border border-brand-500 shadow-xl relative flex flex-col transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-brand-400 to-blue-400 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Most Popular
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Professional</h3>
            <p className="text-brand-100 mb-6 text-sm">For high-volume collision centers needing full control.</p>
            <div className="mb-8">
              <span className="text-4xl font-bold text-white">$399</span>
              <span className="text-brand-200">/mo</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-white">
                <Check size={18} className="text-brand-300" /> Unlimited Users
              </li>
              <li className="flex items-center gap-3 text-white">
                <Check size={18} className="text-brand-300" /> Flag Hours & Labor Tracking
              </li>
              <li className="flex items-center gap-3 text-white">
                <Check size={18} className="text-brand-300" /> Automated Customer SMS
              </li>
              <li className="flex items-center gap-3 text-white">
                <Check size={18} className="text-brand-300" /> Parts Exceptions Dashboard
              </li>
            </ul>
            <Link to="/register" className="w-full py-3 px-4 bg-zinc-900 rounded-full text-center font-medium text-brand-700 hover:bg-brand-50 transition-colors shadow-lg">
              Start Free Trial
            </Link>
          </div>

          {/* Enterprise */}
          <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 shadow-sm flex flex-col">
            <h3 className="text-xl font-bold text-zinc-50 mb-2">Multi-Shop (MSO)</h3>
            <p className="text-zinc-400 mb-6 text-sm">For regional networks with multiple physical locations.</p>
            <div className="mb-8">
              <span className="text-4xl font-bold text-zinc-50">Custom</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-zinc-400">
                <Check size={18} className="text-brand-600" /> Everything in Professional
              </li>
              <li className="flex items-center gap-3 text-zinc-400">
                <Check size={18} className="text-brand-600" /> Multi-Shop Reporting
              </li>
              <li className="flex items-center gap-3 text-zinc-400">
                <Check size={18} className="text-brand-600" /> Dedicated Account Manager
              </li>
            </ul>
            <Link to="/register" className="w-full py-3 px-4 border border-slate-300 rounded-full text-center font-medium text-zinc-300 hover:bg-zinc-950 transition-colors">
              Contact Sales
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
