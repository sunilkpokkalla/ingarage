"use client";
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  SquaresFour, 
  Wrench, 
  Users, 
  Receipt, 
  Timer, 
  FileText, 
  ChartLineUp, 
  Gear, 
  SignOut,
  Package,
  CarProfile,
  WarningCircle
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';

const navItems = [
  { icon: <SquaresFour size={20} weight="duotone" />, label: 'Command Center', path: '/dashboard' },
  { icon: <Wrench size={20} weight="duotone" />, label: 'Active Jobs', path: '/jobs' },
  { icon: <Package size={20} weight="duotone" />, label: 'Parts & Vendors', path: '/parts' },
  { icon: <Timer size={20} weight="duotone" />, label: 'Time & Flagging', path: '/labor' },
  { icon: <Users size={20} weight="duotone" />, label: 'Customers', path: '/customers' },
  { icon: <Receipt size={20} weight="duotone" />, label: 'Invoices', path: '/invoices' },
  { icon: <FileText size={20} weight="duotone" />, label: 'Documents', path: '/documents' },
  { icon: <ChartLineUp size={20} weight="duotone" />, label: 'Analytics', path: '/analytics' },
  { icon: <Gear size={20} weight="duotone" />, label: 'Settings', path: '/settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const supabase = createClient();
  const { data: subscription, isLoading } = useQuery({
    queryKey: ['platformSubscription'],
    queryFn: async () => {
      const { data, error } = await supabase.from('PlatformSubscription').select('*').single();
      if (error && error.code !== 'PGRST116') throw error; // ignore no rows
      return data || null;
    }
  });

  const isBillingIssue = !isLoading && subscription && subscription.status !== 'ACTIVE' && subscription.status !== 'TRIAL';
  const isSettings = pathname?.startsWith('/settings');

  return (
    <div className="flex h-[100dvh] w-full dashboard-theme font-sans selection:bg-brand-500/30 selection:text-white">
      {/* Sidebar - Deep Dark Mode */}
      <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col z-20">
        <div className="h-20 flex items-center gap-3 px-6 border-b border-zinc-800/50">
          <CarProfile size={28} weight="fill" className="text-brand-500" />
          <span className="text-xl font-bold tracking-tighter text-zinc-50 font-['Outfit']">InGarage</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path || 
              (item.path !== '/' && pathname?.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                  isActive 
                    ? 'bg-zinc-900 text-brand-400 border border-zinc-800/50' 
                    : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200 border border-transparent'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800/50">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-medium"
          >
            <SignOut size={20} weight="duotone" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-zinc-950 flex flex-col h-[100dvh] relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/4 w-[50vw] h-[50vw] bg-brand-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        {isBillingIssue && !isSettings ? (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-brand-500/10 blur-[60px] pointer-events-none" />
              <div className="mx-auto w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center rounded-2xl mb-6">
                <WarningCircle size={32} weight="duotone" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-50 mb-3 font-['Outfit']">Action Required</h2>
              <p className="text-zinc-400 mb-8">
                Your platform subscription is past due or inactive. Please update your billing information to continue using InGarage.
              </p>
              <Link 
                href="/settings"
                className="inline-flex justify-center items-center px-6 py-3 bg-brand-500 text-zinc-950 hover:bg-brand-400 rounded-xl font-bold transition-all w-full"
              >
                Go to Billing
              </Link>
            </div>
          </div>
        ) : null}

        {children}
      </main>
    </div>
  );
}
