"use client";
import Link from 'next/link';
import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import { ArrowRight, Play, CheckCircle, Lightning, ShieldCheck, ChartLineUp } from '@phosphor-icons/react';
import { useRef } from 'react';
import { TronCarBackground } from '@/components/TronCarBackground';

const FADE_UP_ANIMATION_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 20 } },
};

export default function MarketingPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div ref={containerRef} className="relative w-full text-zinc-50 overflow-hidden">
      
      {/* Dynamic Background Glow */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[100vw] h-[50vh] bg-brand-500/20 blur-[120px] rounded-full pointer-events-none opacity-50" />
      <div className="absolute top-[40%] right-[-10%] w-[50vw] h-[50vw] bg-blue-500/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Tron Animated Car SVG */}
      <TronCarBackground />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 flex flex-col items-center text-center z-10">
        <motion.div
          initial="hidden"
          animate="show"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            show: {
              transition: { staggerChildren: 0.15 },
            },
          }}
          className="max-w-5xl mx-auto flex flex-col items-center"
        >
          <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
            <span className="text-sm font-medium text-zinc-300">InGarage 2.0 is now live</span>
          </motion.div>
          
          <motion.h1 
            variants={FADE_UP_ANIMATION_VARIANTS}
            className="text-6xl md:text-8xl font-bold tracking-tighter leading-[1.05] mb-8 font-['Outfit'] text-balance"
          >
            Control the floor. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-400 to-zinc-600">Not the chaos.</span>
          </motion.h1>
          
          <motion.p 
            variants={FADE_UP_ANIMATION_VARIANTS}
            className="text-lg md:text-xl text-zinc-400 mb-12 max-w-2xl leading-relaxed font-light"
          >
            Stop running a million-dollar body shop on whiteboards and text messages. Command every repair, part, and payment from one highly-tuned operating system.
          </motion.p>
          
          <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link href="/register" 
              className="group relative flex items-center justify-center gap-2 bg-zinc-50 text-zinc-950 px-8 py-4 rounded-full font-bold transition-all hover:scale-105 active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-brand-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              Start Free Trial <ArrowRight weight="bold" className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="flex items-center justify-center gap-2 bg-zinc-900/50 text-zinc-300 border border-zinc-800 px-8 py-4 rounded-full font-bold hover:bg-zinc-800 hover:text-white transition-all hover:scale-105 active:scale-95 backdrop-blur-sm">
              <Play weight="fill" className="text-brand-500" /> Watch Demo
            </button>
          </motion.div>
        </motion.div>

        {/* Hero Image / Dashboard Showcase */}
        <motion.div 
          style={{ y, opacity }}
          className="relative mt-24 w-full max-w-6xl mx-auto"
        >
          <div className="absolute -inset-1 bg-gradient-to-b from-brand-500/30 to-transparent blur-2xl opacity-50 rounded-[3rem]" />
          <div className="relative rounded-[2rem] border border-zinc-800/80 bg-zinc-900/50 p-2 md:p-4 backdrop-blur-xl shadow-2xl overflow-hidden group">
            
            <div className="relative rounded-[1.5rem] overflow-hidden border border-zinc-800 bg-zinc-950 min-h-[400px] md:min-h-[600px] flex items-center justify-center">
              
              {/* Main Image with Vignette & Dimming */}
              <img src="/hero.png" alt="InGarage Workflow" className="absolute inset-0 w-full h-full object-cover object-center opacity-40 group-hover:opacity-60 transition-opacity duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/80" />
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-transparent to-zinc-950" />
              
              {/* Floating UI Elements Container */}
              <div className="relative z-10 w-full h-full p-8 md:p-12">
                
                {/* Mock Top Nav */}
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="w-full max-w-2xl mx-auto h-12 bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 rounded-xl flex items-center px-4 justify-between shadow-2xl mb-12"
                >
                  <div className="flex gap-2 items-center">
                    <div className="w-3 h-3 rounded-full bg-zinc-700" />
                    <div className="w-3 h-3 rounded-full bg-zinc-700" />
                    <div className="w-3 h-3 rounded-full bg-zinc-700" />
                  </div>
                  <div className="h-4 w-48 bg-zinc-800 rounded-full" />
                  <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-brand-500" />
                  </div>
                </motion.div>

                {/* Floating Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-20">
                  
                  {/* Card 1: Repair Status */}
                  <motion.div 
                    initial={{ opacity: 0, x: -30, rotate: -5 }}
                    animate={{ opacity: 1, x: 0, rotate: -2 }}
                    transition={{ delay: 0.7, type: "spring", stiffness: 100 }}
                    whileHover={{ scale: 1.05, rotate: 0 }}
                    className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 p-6 rounded-2xl shadow-2xl"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-zinc-50 font-bold font-['Outfit'] text-lg">Aston Martin DB12</div>
                      <div className="px-3 py-1 bg-brand-500/20 text-brand-400 text-xs font-bold rounded-full uppercase tracking-wider border border-brand-500/30">
                        In Paint
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Technician</span>
                        <span className="text-zinc-100 font-medium">Mike R.</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Est. Completion</span>
                        <span className="text-zinc-100 font-medium">Today, 4:00 PM</span>
                      </div>
                    </div>
                    <div className="mt-5 w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "75%" }}
                        transition={{ delay: 1.5, duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-brand-500 rounded-full"
                      />
                    </div>
                  </motion.div>

                  {/* Card 2: Quick Metrics */}
                  <motion.div 
                    initial={{ opacity: 0, x: 30, rotate: 5 }}
                    animate={{ opacity: 1, x: 0, rotate: 2 }}
                    transition={{ delay: 0.9, type: "spring", stiffness: 100 }}
                    whileHover={{ scale: 1.05, rotate: 0 }}
                    className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 p-6 rounded-2xl shadow-2xl mt-12 md:mt-24"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                        <CheckCircle size={24} className="text-emerald-500" weight="fill" />
                      </div>
                      <div>
                        <div className="text-zinc-400 text-sm font-medium">Daily Revenue</div>
                        <div className="text-2xl font-bold text-zinc-50 font-['Outfit']">$14,250</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-zinc-800/50 p-3 rounded-xl border border-zinc-700/50">
                        <div className="text-zinc-500 text-xs uppercase font-bold tracking-wider mb-1">Delivered</div>
                        <div className="text-zinc-100 font-bold text-lg">4 Cars</div>
                      </div>
                      <div className="bg-zinc-800/50 p-3 rounded-xl border border-zinc-700/50">
                        <div className="text-zinc-500 text-xs uppercase font-bold tracking-wider mb-1">Intake</div>
                        <div className="text-zinc-100 font-bold text-lg">6 Cars</div>
                      </div>
                    </div>
                  </motion.div>

                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Logos Section */}
      <section className="py-20 border-y border-zinc-900 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-8">Trusted by top collision centers nationwide</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Placeholder Logos */}
            <div className="text-xl font-bold font-serif">Precision Auto</div>
            <div className="text-xl font-black tracking-tighter">ELITE COLLISION</div>
            <div className="text-xl font-bold font-mono">FIX_AUTO</div>
            <div className="text-xl font-medium tracking-widest">CALIBER</div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features Section */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 md:mb-24">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-6 font-['Outfit']">Everything you need.<br/><span className="text-zinc-500">Nothing you don't.</span></h2>
            <p className="text-zinc-400 text-lg max-w-xl">We stripped away the clutter of legacy software to build tools that actually speed up your workflow.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 (Large) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-2 relative rounded-[2rem] bg-zinc-900/40 border border-zinc-800/60 p-8 overflow-hidden group hover:border-zinc-700 transition-colors"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 blur-[80px] rounded-full group-hover:bg-brand-500/20 transition-colors" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="w-12 h-12 rounded-xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center mb-12">
                  <ChartLineUp size={24} className="text-brand-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-zinc-50">Visual Production Board</h3>
                  <p className="text-zinc-400 leading-relaxed max-w-md">Track every vehicle's exact stage in real-time. Know instantly what's in the paint booth and what's waiting on parts.</p>
                </div>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative rounded-[2rem] bg-zinc-900/40 border border-zinc-800/60 p-8 overflow-hidden group hover:border-zinc-700 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center mb-12">
                <Lightning size={24} className="text-yellow-500" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-zinc-50">Lightning Fast</h3>
              <p className="text-zinc-400 leading-relaxed">Built on edge infrastructure. Zero loading spinners. Instant updates across all devices.</p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative rounded-[2rem] bg-zinc-900/40 border border-zinc-800/60 p-8 overflow-hidden group hover:border-zinc-700 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center mb-12">
                <ShieldCheck size={24} className="text-emerald-500" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-zinc-50">Bank-Grade Security</h3>
              <p className="text-zinc-400 leading-relaxed">Your customer data and financials are protected by state-of-the-art encryption and Row Level Security.</p>
            </motion.div>

            {/* Feature 4 (Large) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="md:col-span-2 relative rounded-[2rem] bg-zinc-900/40 border border-zinc-800/60 p-8 overflow-hidden group hover:border-zinc-700 transition-colors flex items-center"
            >
              <div className="relative z-10 flex-1">
                <h3 className="text-2xl font-bold mb-3 text-zinc-50">One-Click Invoicing</h3>
                <p className="text-zinc-400 leading-relaxed max-w-md">Turn an approved estimate into a final invoice and collect payment instantly via Stripe. No more chasing checks.</p>
                <Link href="/features" className="inline-flex items-center gap-2 mt-6 text-brand-400 hover:text-brand-300 font-semibold transition-colors">
                  Explore all features <ArrowRight weight="bold" />
                </Link>
              </div>
              <div className="hidden md:block flex-1 relative h-48">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-48 bg-zinc-800/50 rounded-xl border border-zinc-700 transform rotate-12 shadow-2xl backdrop-blur-sm p-4 flex flex-col gap-3">
                  <div className="h-4 w-1/3 bg-zinc-700 rounded-full" />
                  <div className="h-8 w-1/2 bg-brand-500/20 text-brand-400 rounded-lg flex items-center px-3 font-mono text-sm">$4,250.00</div>
                  <div className="h-10 w-full bg-zinc-700 rounded-lg mt-auto flex items-center justify-center text-xs text-zinc-400 font-bold uppercase">Pay Now</div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Premium Testimonial Section */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto relative">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative w-full bg-zinc-900/40 border border-zinc-800/60 rounded-[3rem] overflow-hidden shadow-2xl backdrop-blur-xl group"
          >
            {/* Background Image that fades into the card */}
            <div className="absolute inset-0 md:w-1/2 lg:w-[45%] right-0 ml-auto h-full z-0 opacity-60 md:opacity-100 mix-blend-luminosity grayscale group-hover:grayscale-0 group-hover:mix-blend-normal transition-all duration-1000">
              <img src="/owner.png" alt="Shop Owner" className="w-full h-full object-cover object-top" />
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-900/80 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-brand-900/20 mix-blend-multiply" />
            </div>

            {/* Floating Stat Badges */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="absolute hidden lg:flex top-12 right-12 z-20 bg-zinc-950/80 border border-brand-500/30 backdrop-blur-md rounded-2xl p-4 items-center gap-4 shadow-xl"
            >
              <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-500">
                <ChartLineUp size={20} weight="bold" />
              </div>
              <div>
                <p className="text-brand-400 font-bold text-xl leading-none">-2.4 Days</p>
                <p className="text-zinc-400 text-xs uppercase tracking-widest mt-1">Cycle Time</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="absolute hidden lg:flex bottom-12 right-24 z-20 bg-zinc-950/80 border border-emerald-500/30 backdrop-blur-md rounded-2xl p-4 items-center gap-4 shadow-xl"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                <Lightning size={20} weight="bold" />
              </div>
              <div>
                <p className="text-emerald-400 font-bold text-xl leading-none">+18%</p>
                <p className="text-zinc-400 text-xs uppercase tracking-widest mt-1">Efficiency</p>
              </div>
            </motion.div>

            <div className="relative z-10 w-full md:w-[65%] lg:w-[55%] p-10 md:p-16 lg:p-20 flex flex-col justify-center min-h-[500px]">
              <div className="w-14 h-14 rounded-full bg-brand-500 text-zinc-50 flex items-center justify-center mb-10 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                <span className="text-4xl font-serif leading-none pt-2">"</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-50 mb-8 font-serif leading-[1.15] text-balance">
                "We used to spend three hours a day just figuring out where cars were. Now, InGarage tells us instantly."
              </h2>
              
              <div className="flex items-center gap-5 mt-auto pt-8 border-t border-zinc-800/80">
                <div className="w-14 h-14 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 font-bold tracking-widest">
                  JD
                </div>
                <div>
                  <h4 className="text-zinc-50 font-bold text-lg">Jameson Davies</h4>
                  <p className="text-brand-400 text-sm font-mono tracking-widest uppercase mt-1">Owner, Precision Auto Works</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Full-Bleed Image Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto rounded-[3rem] overflow-hidden relative h-[600px] shadow-2xl flex items-center justify-center text-center">
          <img src="/floor.png" alt="Shop Floor" className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]" />
          
          <div className="relative z-10 max-w-3xl px-6">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8 font-['Outfit'] text-balance">Built for the mechanics, not just the accountants.</h2>
            <p className="text-xl text-zinc-300 mb-10 font-light">The first shop management system that your technicians will actually want to use. Minimal taps, maximum touch time.</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4 font-['Outfit']">Frequently Asked Questions</h2>
            <p className="text-zinc-400 text-lg">Everything you need to know about switching to InGarage.</p>
          </div>
          <div className="space-y-6">
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-zinc-50 mb-2">How long does it take to migrate my shop?</h3>
              <p className="text-zinc-400 leading-relaxed">Most shops are fully migrated and trained within 48 hours. Our automated import tools can pull your existing customer and job history directly from legacy systems.</p>
            </div>
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-zinc-50 mb-2">Do technicians need their own devices?</h3>
              <p className="text-zinc-400 leading-relaxed">InGarage is fully responsive. Technicians can clock in and out using their personal smartphones, or you can mount shared tablets in each bay. The choice is yours.</p>
            </div>
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-zinc-50 mb-2">Can I process payments directly through the app?</h3>
              <p className="text-zinc-400 leading-relaxed">Yes! InGarage integrates directly with Stripe. You can send an invoice link via SMS or email, and customers can pay securely from their phones before they even arrive to pick up their car.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative z-10 overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[100vw] h-[50vh] bg-brand-500/10 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10 bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-2xl rounded-[3rem] p-12 md:p-24 shadow-2xl">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6 font-['Outfit']">Ready to upgrade your shop?</h2>
          <p className="text-lg text-zinc-400 mb-10 max-w-xl mx-auto">Join the top-tier collision centers that have completely eliminated chaos from their floor.</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-500 text-white px-10 py-4 rounded-full font-bold hover:bg-brand-600 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(239,68,68,0.3)]"
            >
              Start Your Free Trial
            </Link>
            <Link href="/pricing" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-transparent text-zinc-300 border border-zinc-700 px-10 py-4 rounded-full font-bold hover:bg-zinc-800 transition-all"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
      
    </div>
  );
}
