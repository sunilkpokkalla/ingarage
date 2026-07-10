"use client";
import { useState } from 'react';
import { EnvelopeSimple, MapPin, Phone, PaperPlaneTilt } from '@phosphor-icons/react';

export default function Contact() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setTimeout(() => setStatus('success'), 1500);
  };

  return (
    <div className="w-full min-h-screen bg-zinc-950 flex flex-col items-center pt-32 px-6 pb-24">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16">
        
        {/* Left Side - Info */}
        <div>
          <p className="text-brand-500 font-bold uppercase tracking-widest text-sm mb-4">Contact Us</p>
          <h1 className="text-4xl md:text-6xl font-bold text-zinc-50 tracking-tighter mb-6 font-['Outfit']">
            Let's talk about your shop.
          </h1>
          <p className="text-zinc-400 text-lg mb-12 max-w-md leading-relaxed">
            Whether you're looking for a demo, need help migrating your data, or just have a question about our pricing, our team is ready to help.
          </p>

          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-brand-400">
                <EnvelopeSimple size={24} weight="duotone" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-100 font-['Outfit']">Email</h3>
                <p className="text-zinc-400 text-sm mt-1">support@ingarage.com</p>
                <p className="text-zinc-400 text-sm">sales@ingarage.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-blue-400">
                <Phone size={24} weight="duotone" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-100 font-['Outfit']">Phone</h3>
                <p className="text-zinc-400 text-sm mt-1">+1 (800) 555-0199</p>
                <p className="text-zinc-500 text-xs mt-1 font-mono">Mon-Fri from 8am to 6pm EST.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
                <MapPin size={24} weight="duotone" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-100 font-['Outfit']">Headquarters</h3>
                <p className="text-zinc-400 text-sm mt-1">100 Innovation Drive<br />Suite 400<br />Austin, TX 78701</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 lg:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 blur-[80px] rounded-full pointer-events-none" />
          
          {status === 'success' ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-20 h-20 bg-brand-500/10 rounded-full flex items-center justify-center text-brand-400 mb-6">
                <PaperPlaneTilt size={40} weight="fill" />
              </div>
              <h3 className="text-2xl font-bold text-zinc-100 mb-4 font-['Outfit']">Message Sent!</h3>
              <p className="text-zinc-400">We'll get back to you as soon as possible.</p>
              <button 
                onClick={() => setStatus('idle')}
                className="mt-8 text-brand-400 font-bold text-sm hover:text-brand-300"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 font-mono">First Name</label>
                  <input required type="text" className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition-colors" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 font-mono">Last Name</label>
                  <input required type="text" className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition-colors" placeholder="Smith" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 font-mono">Work Email</label>
                <input required type="email" className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition-colors" placeholder="john@smithcollision.com" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 font-mono">Shop Name</label>
                <input required type="text" className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition-colors" placeholder="Smith Collision Center" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 font-mono">How can we help?</label>
                <textarea required rows={4} className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition-colors resize-none" placeholder="Tell us about your current workflow..." />
              </div>

              <button 
                type="submit" 
                disabled={status === 'sending'}
                className="w-full bg-brand-500 hover:bg-brand-400 text-zinc-950 font-bold py-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {status === 'sending' ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
