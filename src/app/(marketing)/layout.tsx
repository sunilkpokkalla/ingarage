"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CarProfile } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Features', path: '/features' },
    { name: 'Stories', path: '/stories' },
    { name: 'Integrations', path: '/integrations' },
    { name: 'Pricing', path: '/pricing' }
  ];

  return (
    <div className="min-h-[100dvh] bg-zinc-50 text-zinc-800 font-sans flex flex-col selection:bg-brand-500/30 selection:text-brand-950 overflow-x-hidden">
      
      {/* Premium Floating Nav */}
      <div className="fixed top-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <motion.nav 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="pointer-events-auto flex items-center justify-between px-6 py-3 rounded-full liquid-glass-light shadow-xl shadow-brand-900/5 max-w-4xl w-full border-white/40"
        >
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-full bg-zinc-950 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                <CarProfile size={22} weight="fill" />
              </div>
              <span className="text-xl font-bold tracking-tighter text-zinc-950 font-display font-['Outfit']">InGarage</span>
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
                    <span className={`relative z-10 ${isActive ? 'text-zinc-950 font-semibold' : 'text-zinc-500 hover:text-zinc-900'}`}>
                      {link.name}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-black/5 rounded-full z-0"
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-zinc-600 hover:text-zinc-950 transition-colors px-4 py-2">
              Log In
            </Link>
            <Link href="/register" 
              className="text-sm font-bold bg-zinc-950 text-white px-6 py-2.5 rounded-full hover:bg-zinc-800 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-zinc-950/20"
            >
              Start Free Trial
            </Link>
          </div>
        </motion.nav>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full pt-32 relative z-10">
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
      <footer className="border-t border-zinc-200 bg-white py-16 px-6 mt-20 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 opacity-50 grayscale mb-4">
              <CarProfile size={24} weight="duotone" />
              <span className="text-xl font-bold tracking-tighter font-['Outfit']">InGarage</span>
            </div>
            <p className="text-zinc-400 text-sm max-w-xs">
              The modern operating system for high-performance collision centers. Built to eliminate chaos and maximize touch time.
            </p>
          </div>
          
          <div className="flex flex-col gap-3 text-sm font-medium text-zinc-500">
            <strong className="text-zinc-950 mb-2">Product</strong>
            <Link href="/features" className="hover:text-brand-500 transition-colors">Features</Link>
            <Link href="/stories" className="hover:text-brand-500 transition-colors">Customer Stories</Link>
            <Link href="/integrations" className="hover:text-brand-500 transition-colors">Integrations</Link>
            <Link href="/pricing" className="hover:text-brand-500 transition-colors">Pricing</Link>
          </div>

          <div className="flex flex-col gap-3 text-sm font-medium text-zinc-500">
            <strong className="text-zinc-950 mb-2">Company</strong>
            <Link href="/about" className="hover:text-brand-500 transition-colors">About Us</Link>
            <Link href="/resources" className="hover:text-brand-500 transition-colors">Resources</Link>
            <Link href="/contact" className="hover:text-brand-500 transition-colors">Contact</Link>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-zinc-200">
          <p className="text-zinc-400 text-sm">
            © {new Date().getFullYear()} InGarage Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
