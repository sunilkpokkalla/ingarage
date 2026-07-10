"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { 
  ArrowRight, 
  Play,
  Quotes
} from '@phosphor-icons/react';

export default function Home() {
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
    <div className="flex flex-col relative w-full overflow-hidden bg-zinc-950">
      
      {/* Narrative Hero: Left text, Right Image */}
      <section className="relative z-10 pt-32 pb-32 px-6 bg-zinc-50 rounded-b-[4rem]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div 
            className="flex flex-col items-start"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full liquid-glass border border-brand-500/20 text-brand-700 text-xs font-bold uppercase tracking-widest mb-8">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              InGarage 2.0 is Live
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold text-zinc-950 tracking-tighter leading-[1.05] mb-6 font-['Outfit'] text-balance">
              Control the floor. <br/>
              <span className="text-zinc-400">Not the chaos.</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-lg md:text-xl text-zinc-500 mb-10 max-w-[45ch] leading-relaxed">
              Stop running a million-dollar body shop on whiteboards and text messages. Command every repair, part, and payment from one unified operating system.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link href="/register" 
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-zinc-950 text-white px-8 py-4 rounded-full font-bold hover:bg-zinc-800 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-zinc-950/20"
              >
                Start Free Trial <ArrowRight weight="bold" />
              </Link>
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-zinc-950 px-8 py-4 rounded-full font-bold hover:bg-zinc-50 border border-zinc-200 transition-all hover:scale-[1.02] active:scale-[0.98]">
                <Play weight="fill" className="text-brand-500" /> Watch Demo
              </button>
            </motion.div>
          </motion.div>

          <motion.div 
            className="relative w-full h-[600px] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-zinc-950/10"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 60, damping: 20, delay: 0.2 }}
          >
            <img src="/hero.png" alt="Mechanic using InGarage tablet next to luxury car" className="absolute inset-0 w-full h-full object-cover" />
          </motion.div>

        </div>
      </section>

      {/* Success Story Section */}
      <section className="py-32 px-6 bg-zinc-950 relative z-10 overflow-hidden text-zinc-50">
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-brand-500/10 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div 
            className="order-2 lg:order-1 relative w-full aspect-[4/5] md:aspect-square lg:aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", stiffness: 60, damping: 20 }}
          >
             <img src="/owner.png" alt="Auto body shop owner portrait" className="absolute inset-0 w-full h-full object-cover" />
          </motion.div>

          <motion.div 
            className="order-1 lg:order-2 flex flex-col items-start"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <Quotes size={48} weight="fill" className="text-brand-500 mb-8 opacity-50" />
            </motion.div>
            
            <motion.h2 variants={itemVariants} className="text-3xl md:text-5xl font-bold tracking-tighter leading-[1.1] mb-8 font-['Outfit'] text-balance">
              "We used to spend three hours a day just figuring out where cars were. Now, InGarage tells us instantly."
            </motion.h2>
            
            <motion.p variants={itemVariants} className="text-xl text-zinc-400 mb-10 leading-relaxed font-light">
              When Precision Auto Works switched to InGarage, they completely eliminated their physical whiteboards. Within 30 days, their average cycle time dropped by 2.4 days, and technician efficiency increased by 18%.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center bg-zinc-900 text-zinc-400 font-bold">JD</div>
              <div>
                <strong className="block text-zinc-50 font-['Outfit']">Jameson Davies</strong>
                <span className="text-sm text-zinc-500 font-mono tracking-widest uppercase">Owner, Precision Auto Works</span>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* Atmospheric Full-Bleed Feature */}
      <section className="relative w-full h-[80vh] min-h-[600px] flex items-center justify-center px-6 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/floor.png" alt="Massive collision center floor" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center mt-32">
          <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-6 font-['Outfit'] text-balance shadow-black/50 drop-shadow-2xl">
            See the entire floor. <br/> From anywhere.
          </h2>
          <p className="text-xl text-zinc-300 max-w-2xl mb-10 leading-relaxed font-light shadow-black/50 drop-shadow-lg">
            The visual production board tracks every vehicle, part exception, and labor hour in real time. Know exactly what's holding up the booth before it costs you money.
          </p>
          <Link href="/features" 
            className="flex items-center justify-center gap-2 bg-brand-500 text-zinc-950 px-10 py-4 rounded-full font-bold hover:bg-brand-400 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-500/20"
          >
            Explore Platform Features
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 bg-zinc-950 relative z-10">
        <div className="max-w-5xl mx-auto rounded-[3rem] p-16 text-center relative overflow-hidden border border-zinc-800/50 liquid-glass">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-brand-500/10 blur-[150px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center">
            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-6 font-['Outfit'] text-balance">
              Ready to take control?
            </h2>
            <p className="text-xl text-zinc-400 max-w-2xl mb-12">
              Join top-tier collision centers upgrading from legacy systems to a modern, fast, and secure platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/register" 
                className="flex items-center justify-center gap-2 bg-white text-zinc-950 px-10 py-4 rounded-full font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10"
              >
                Get Started Free
              </Link>
              <Link href="/pricing" 
                className="flex items-center justify-center gap-2 bg-transparent text-white border border-white/20 px-10 py-4 rounded-full font-bold hover:bg-white/5 active:scale-95 transition-all"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
}
