"use client";
import { motion } from 'framer-motion';
import { 
  ChartLineUp, 
  Users, 
  FileText, 
  CarProfile, 
  Wrench, 
  Package, 
  Bank,
  CheckCircle
} from '@phosphor-icons/react';
import Link from 'next/link';

export default function FeaturesPage() {
  const features = [
    {
      icon: <ChartLineUp size={28} className="text-brand-500" />,
      title: "Visual Production Board",
      description: "A drag-and-drop Kanban style board showing exactly where every vehicle is in your shop. Filter by technician, insurance company, or delay status.",
      benefits: ["Identify bottlenecks instantly", "Reduce idle wait times", "Color-coded priority flags"]
    },
    {
      icon: <Users size={28} className="text-blue-500" />,
      title: "Customer CRM",
      description: "Manage all customer interactions in one place. Send automated SMS or email updates when a vehicle moves to the next stage.",
      benefits: ["Automated status updates", "Integrated communication log", "One-click approval requests"]
    },
    {
      icon: <FileText size={28} className="text-emerald-500" />,
      title: "Estimates & Invoicing",
      description: "Convert an estimate into a repair order, and a repair order into a final invoice in just two clicks. Fully integrated with Stripe for instant payments.",
      benefits: ["Collect payments via link", "Syncs with Quickbooks", "Profitability tracking per job"]
    },
    {
      icon: <Wrench size={28} className="text-amber-500" />,
      title: "Labor Tracking",
      description: "Technicians clock in and out of specific jobs directly from their bay using a tablet. See exactly who is making you money and who isn't.",
      benefits: ["Flag vs. Actual hour tracking", "Technician efficiency reports", "Tablet-friendly interface"]
    },
    {
      icon: <Package size={28} className="text-purple-500" />,
      title: "Parts Management",
      description: "Never lose a part again. Track orders, returns, and core charges. Automatically flag jobs that are 'waiting on parts'.",
      benefits: ["Vendor catalog integration", "Automated markup calculation", "Return tracking"]
    },
    {
      icon: <Bank size={28} className="text-rose-500" />,
      title: "Insurance Integrations",
      description: "Seamlessly import estimates from CCC, Mitchell, and Audatex. We parse the EMS/BMS files so you don't have to double-enter data.",
      benefits: ["Instant EMS/BMS import", "Supplement tracking", "Direct-repair program ready"]
    }
  ];

  return (
    <div className="min-h-screen pt-32 pb-24 px-6">
      
      <div className="max-w-7xl mx-auto text-center mb-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-6"
        >
          <span className="text-sm font-medium text-brand-400">Platform Features</span>
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 text-zinc-50 font-['Outfit'] text-balance"
        >
          Everything you need.<br/>
          <span className="text-zinc-500">Nothing you don't.</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed"
        >
          We analyzed hundreds of collision centers to build exactly what speeds up your workflow, while ruthlessly cutting the bloat of legacy software.
        </motion.p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="bg-zinc-900/40 border border-zinc-800/60 rounded-[2rem] p-8 hover:bg-zinc-900 hover:border-zinc-700 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[50px] rounded-full group-hover:bg-brand-500/10 transition-colors" />
            
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              
              <h3 className="text-2xl font-bold text-zinc-50 mb-3">{feature.title}</h3>
              <p className="text-zinc-400 mb-8 leading-relaxed h-24">
                {feature.description}
              </p>
              
              <ul className="space-y-3">
                {feature.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                    <CheckCircle size={18} className="text-brand-500 shrink-0 mt-0.5" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto mt-32 text-center bg-brand-950/20 border border-brand-900/30 rounded-[3rem] p-16"
      >
        <h2 className="text-4xl font-bold text-white mb-6 tracking-tight font-['Outfit']">Ready to see it in action?</h2>
        <p className="text-brand-200/60 mb-8 max-w-lg mx-auto">Get your shop set up on InGarage in less than 5 minutes. Import your data, invite your team, and take control.</p>
        <Link href="/register" className="inline-block bg-brand-500 text-white px-10 py-4 rounded-full font-bold hover:bg-brand-400 transition-colors shadow-[0_0_30px_rgba(239,68,68,0.3)] hover:scale-105">
          Start Free Trial
        </Link>
      </motion.div>

    </div>
  );
}
