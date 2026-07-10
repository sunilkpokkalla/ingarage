"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ArrowRight, Checks, ListMagnifyingGlass, Package, BellRinging } from '@phosphor-icons/react';

export default function Features() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  return (
    <div className="w-full relative bg-zinc-950 overflow-hidden font-sans pt-32">
      
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-brand-500/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 mb-32 relative z-10 text-center">
        <motion.h1 
          className="text-5xl md:text-7xl font-bold text-zinc-50 tracking-tighter mb-6 font-['Outfit'] text-balance"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          The complete operating system <br/> <span className="text-brand-500">for modern collision centers.</span>
        </motion.h1>
        <motion.p 
          className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          From intake and damage assessment to parts management and final invoicing, InGarage replaces your whiteboards with a single, real-time digital production board.
        </motion.p>
      </div>

      {/* Feature 1: Estimation Bay (Left Image, Right Text) */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            className="w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-zinc-950 border border-zinc-800"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", stiffness: 60, damping: 20 }}
          >
            <img src="/estimation.png" alt="Estimator inspecting luxury vehicle" className="w-full h-full object-cover" />
          </motion.div>

          <motion.div 
            className="flex flex-col items-start"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div variants={itemVariants} className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500 mb-6 border border-brand-500/20">
              <ListMagnifyingGlass size={28} weight="duotone" />
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
                  <Checks size={20} className="text-brand-500" weight="bold" />
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
              Parts Exceptions
            </motion.h2>
            
            <motion.p variants={itemVariants} className="text-xl text-zinc-400 mb-8 leading-relaxed">
              Never miss a cycle time metric because of a single missing clip. Track vendor ETAs, mirror-match upon arrival, and instantly notify techs when a cart is ready.
            </motion.p>

            <motion.ul variants={containerVariants} className="space-y-4">
              {['Barcode receiving', 'Automated vendor alerts', 'Missing part dashboard'].map((feature) => (
                <motion.li variants={itemVariants} key={feature} className="flex items-center gap-3 text-zinc-300 font-medium">
                  <Checks size={20} className="text-zinc-500" weight="bold" />
                  {feature}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          <motion.div 
            className="order-1 lg:order-2 w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-zinc-950 border border-zinc-800"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", stiffness: 60, damping: 20 }}
          >
            <img src="/parts.png" alt="Mechanic scanning parts in organized room" className="w-full h-full object-cover" />
          </motion.div>
        </div>
      </section>

      {/* Feature 3: Comms (Centered Minimal) */}
      <section className="py-32 px-6 relative z-10 text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-16 h-16 rounded-3xl bg-brand-500 flex items-center justify-center text-zinc-950 mb-8 shadow-xl shadow-brand-500/20"
          >
            <BellRinging size={32} weight="fill" />
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-zinc-50 tracking-tighter mb-6 font-['Outfit']">
            Silence the front office.
          </h2>
          <p className="text-xl text-zinc-400 mb-12 leading-relaxed">
            Automate SMS and email updates at every major repair milestone. Keep your customers informed and let your estimators focus on writing, not answering the phone.
          </p>

          <Link href="/register" 
            className="inline-flex items-center justify-center gap-2 bg-zinc-50 hover:bg-zinc-200 text-zinc-950 px-8 py-4 rounded-full text-lg font-bold transition-all hover:scale-105 active:scale-95 shadow-xl"
          >
            Start your free trial
            <ArrowRight size={20} weight="bold" />
          </Link>
        </div>
      </section>

    </div>
  );
}
