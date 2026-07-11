"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from '@phosphor-icons/react';
import Link from 'next/link';

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);

  const tiers = [
    {
      name: "Starter",
      description: "Perfect for single-location shops looking to get organized.",
      price: isAnnual ? 199 : 249,
      features: [
        "Up to 5 team members",
        "Visual Production Board",
        "Customer CRM",
        "Unlimited Jobs & Estimates",
        "Standard Email Support"
      ],
      highlighted: false,
      ctaText: "Start Free Trial"
    },
    {
      name: "Professional",
      description: "For high-volume collision centers needing advanced tools.",
      price: isAnnual ? 399 : 499,
      features: [
        "Up to 15 team members",
        "Everything in Starter",
        "One-Click Invoicing via Stripe",
        "Automated Customer SMS updates",
        "CCC/Mitchell/Audatex Import",
        "Priority 24/7 Support"
      ],
      highlighted: true,
      ctaText: "Start 14-Day Free Trial"
    },
    {
      name: "Enterprise",
      description: "For MSOs and regional networks needing custom control.",
      price: isAnnual ? 899 : 1099,
      features: [
        "Unlimited team members",
        "Multi-location management",
        "Custom API Integrations",
        "Dedicated Success Manager",
        "White-labeled customer portal",
        "SLA Guarantees"
      ],
      highlighted: false,
      ctaText: "Contact Sales"
    }
  ];

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 overflow-hidden relative">
      
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[80vw] h-[50vh] bg-brand-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[50vw] h-[50vh] bg-blue-500/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto text-center mb-20 relative z-10">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 text-zinc-50 font-['Outfit']"
        >
          Simple, transparent pricing.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12 font-light"
        >
          No hidden fees, no per-RO charges. Just a flat rate to run your entire body shop smoothly.
        </motion.p>

        {/* Pricing Toggle */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-4"
        >
          <span className={`text-sm font-medium transition-colors ${!isAnnual ? 'text-zinc-50' : 'text-zinc-500'}`}>Monthly</span>
          <button 
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-16 h-8 rounded-full bg-zinc-800 border border-zinc-700 relative flex items-center p-1 transition-colors hover:bg-zinc-700"
          >
            <motion.div 
              className="w-6 h-6 bg-brand-500 rounded-full"
              layout
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              animate={{ x: isAnnual ? 32 : 0 }}
            />
          </button>
          <span className={`text-sm font-medium transition-colors ${isAnnual ? 'text-zinc-50' : 'text-zinc-500'} flex items-center gap-2`}>
            Annually 
            <span className="text-[10px] uppercase tracking-wider bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-full font-bold">Save 20%</span>
          </span>
        </motion.div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {tiers.map((tier, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + (idx * 0.1) }}
            className={`relative rounded-[2rem] p-8 flex flex-col transition-transform hover:-translate-y-2 ${
              tier.highlighted 
                ? 'bg-zinc-900 border-2 border-brand-500 shadow-[0_0_50px_rgba(239,68,68,0.1)]' 
                : 'bg-zinc-900/40 border border-zinc-800/60'
            }`}
          >
            {tier.highlighted && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
                Most Popular
              </div>
            )}
            
            <h3 className="text-2xl font-bold text-zinc-50 mb-2">{tier.name}</h3>
            <p className="text-zinc-400 text-sm mb-6 h-10">{tier.description}</p>
            
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-5xl font-black text-zinc-50 tracking-tighter">${tier.price}</span>
              <span className="text-zinc-500">/mo</span>
            </div>
            
            <Link 
              href="/register" 
              className={`w-full text-center py-3.5 rounded-xl font-bold transition-all mb-10 ${
                tier.highlighted 
                  ? 'bg-brand-500 text-white hover:bg-brand-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]' 
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              {tier.ctaText}
            </Link>
            
            <div className="flex flex-col gap-4 mt-auto">
              <span className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">What's included:</span>
              {tier.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-brand-500 shrink-0 mt-0.5" />
                  <span className="text-zinc-300 text-sm leading-tight">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  );
}
