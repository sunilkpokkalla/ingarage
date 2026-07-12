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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="w-full min-h-[100dvh] bg-transparent pt-32 pb-24 font-sans text-zinc-50 overflow-hidden">
      
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 text-center mb-32 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-950/30 border border-brand-900/50 text-sm font-medium text-brand-500 mb-8"
        >
          <ChartLineUp size={16} />
          Complete Shop Control
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 font-['Outfit']"
        >
          Everything you need to <br className="hidden md:block" />run a 7-figure shop.
        </motion.h1>
      </div>

      {/* Feature 1: Estimation (Left Image, Right Text) */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            className="w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-zinc-950 border border-zinc-800"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", stiffness: 60, damping: 20 }}
          >
            <img src="/estimation.png" alt="Estimator inspecting luxury vehicle" className="w-full h-full object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700" />
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-900/40 to-transparent mix-blend-multiply pointer-events-none" />
          </motion.div>

          <motion.div 
            className="flex flex-col items-start"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div variants={itemVariants} className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500 mb-6 border border-brand-500/20">
              <FileText size={28} weight="duotone" />
            </motion.div>
            
            <motion.h2 variants={itemVariants} className="text-3xl md:text-5xl font-bold text-zinc-50 tracking-tighter leading-[1.1] mb-6 font-['Outfit']">
              Intake & Assessment
            </motion.h2>
            
            <motion.p variants={itemVariants} className="text-xl text-zinc-400 mb-8 leading-relaxed">
              Drop the clipboard. Write your initial assessments, flag priority damages, and sync immediately with the production board before the car even leaves the bay.
            </motion.p>

            <motion.ul variants={containerVariants} className="space-y-4">
              {['Real-time VIN decoding', 'Direct photo uploads', 'Automated supplement flags'].map((feature) => (
                <motion.li variants={itemVariants} key={feature} className="flex items-center gap-3 text-zinc-300 font-medium">
                  <CheckCircle size={20} className="text-brand-500" weight="bold" />
                  {feature}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </div>
      </section>

      {/* Feature 2: Parts Room (Left Text, Right Image) */}
      <section className="py-24 px-6 relative z-10 bg-zinc-900/50 border-y border-zinc-800/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div 
            className="order-2 lg:order-1 flex flex-col items-start"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div variants={itemVariants} className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-50 mb-6 border border-zinc-700">
              <Package size={28} weight="duotone" />
            </motion.div>
            
            <motion.h2 variants={itemVariants} className="text-3xl md:text-5xl font-bold text-zinc-50 tracking-tighter leading-[1.1] mb-6 font-['Outfit']">
              Parts Inventory
            </motion.h2>
            
            <motion.p variants={itemVariants} className="text-xl text-zinc-400 mb-8 leading-relaxed">
              Never miss a cycle time metric because of a single missing clip. Track vendor ETAs, mirror-match upon arrival, and instantly notify techs when a cart is ready.
            </motion.p>

            <motion.ul variants={containerVariants} className="space-y-4">
              {['Barcode receiving', 'Automated vendor alerts', 'Missing part dashboard'].map((feature) => (
                <motion.li variants={itemVariants} key={feature} className="flex items-center gap-3 text-zinc-300 font-medium">
                  <CheckCircle size={20} className="text-zinc-500" weight="bold" />
                  {feature}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          <motion.div 
            className="order-1 lg:order-2 relative w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-zinc-950 border border-zinc-800"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", stiffness: 60, damping: 20 }}
          >
            <img src="/parts.png" alt="Mechanic scanning parts in organized room" className="w-full h-full object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700" />
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-900/40 to-transparent mix-blend-multiply pointer-events-none" />
          </motion.div>
        </div>
      </section>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto mt-32 text-center bg-brand-950/20 border border-brand-900/30 rounded-[3rem] p-16 relative z-10"
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
