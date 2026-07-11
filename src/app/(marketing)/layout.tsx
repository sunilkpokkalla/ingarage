"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CarProfile } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { TronCarBackground } from '@/components/TronCarBackground';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Features', path: '/features' },
    { name: 'Stories', path: '/stories' },
    { name: 'Integrations', path: '/integrations' },
    { name: 'About', path: '/about' },
    { name: 'Pricing', path: '/pricing' }
  ];

  return (
    <div className="min-h-[100dvh] bg-[#030303] text-zinc-50 font-sans flex flex-col selection:bg-brand-500/30 selection:text-brand-100 overflow-x-hidden">
      
      {/* Premium Floating Nav */}
      <div className="fixed top-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <motion.nav 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="pointer-events-auto flex items-center justify-between px-4 py-2.5 rounded-full bg-zinc-950/60 backdrop-blur-xl shadow-2xl max-w-4xl w-full border border-zinc-800/60"
        >
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group ml-2">
              <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                <CarProfile size={18} weight="fill" />
              </div>
              <span className="text-xl font-bold tracking-tighter text-zinc-50 font-display font-['Outfit']">InGarage</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => {
                const isActive = pathname === link.path;
                return (
                  <Link 
                    key={link.path}
                    href={link.path}
                    className="relative px-4 py-2 text-sm font-medium transition-colors"
                  >
                    <span className={`relative z-10 ${isActive ? 'text-zinc-50 font-semibold' : 'text-zinc-400 hover:text-zinc-100'}`}>
                      {link.name}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-zinc-800/80 rounded-full z-0"
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-zinc-50 transition-colors px-4 py-2">
              Log In
            </Link>
            <Link href="/register" 
              className="text-sm font-bold bg-zinc-50 text-zinc-950 px-6 py-2 rounded-full hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95"
            >
              Start Free Trial
            </Link>
          </div>
        </motion.nav>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full relative z-10">
        <TronCarBackground />
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-[#030303] py-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <CarProfile size={24} weight="duotone" className="text-brand-500" />
              <span className="text-2xl font-bold tracking-tighter font-['Outfit'] text-zinc-50">InGarage</span>
            </div>
            <p className="text-zinc-500 text-sm max-w-xs leading-relaxed">
              The modern operating system for high-performance collision centers. Built to eliminate chaos and maximize touch time.
            </p>
          </div>
          
          <div className="flex flex-col gap-4 text-sm font-medium text-zinc-500">
            <strong className="text-zinc-50 tracking-widest uppercase text-xs">Product</strong>
            <Link href="/features" className="hover:text-brand-500 transition-colors">Features</Link>
            <Link href="/pricing" className="hover:text-brand-500 transition-colors">Pricing</Link>
            <Link href="/login" className="hover:text-brand-500 transition-colors">Log In</Link>
          </div>

          <div className="flex flex-col gap-4 text-sm font-medium text-zinc-500">
            <strong className="text-zinc-50 tracking-widest uppercase text-xs">Legal</strong>
            <span className="cursor-not-allowed">Privacy Policy</span>
            <span className="cursor-not-allowed">Terms of Service</span>
            <a href="mailto:support@ingarage.us" className="hover:text-brand-500 transition-colors">Contact</a>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-600 text-sm">
            © {new Date().getFullYear()} InGarage Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-zinc-600 text-sm">
            <span>Made for Auto Body Shops</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
