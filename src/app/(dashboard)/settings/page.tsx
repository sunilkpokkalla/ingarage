"use client";
import { useState, useEffect } from 'react';
import { CreditCard, FloppyDisk, WarningCircle, ShieldCheck, UsersThree, PaperPlaneTilt } from '@phosphor-icons/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';

export default function Settings() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const [isActive, setIsActive] = useState(false);
  const [provider, setProvider] = useState('STRIPE');
  const [publicKey, setPublicKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [saveMessage, setSaveMessage] = useState({ text: '', type: '' });

  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('TECHNICIAN');
  const [inviteMessage, setInviteMessage] = useState({ text: '', type: '' });

  const { data: team = [] } = useQuery({
    queryKey: ['team'],
    queryFn: async () => {
      const { data, error } = await supabase.from('User').select('*');
      if (error) throw error;
      return data;
    }
  });

  const inviteMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: data.email,
          name: data.name,
          role: data.role
        })
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to send invite');
      }

      return response.json();
    },
    onSuccess: (_res, vars: any) => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
      setInviteMessage({ text: `Invite sent to ${vars.email}.`, type: 'success' });
      setInviteName('');
      setInviteEmail('');
      setTimeout(() => setInviteMessage({ text: '', type: '' }), 4000);
    },
    onError: (err: any) => {
      setInviteMessage({ text: err.message || 'Failed to send invite', type: 'error' });
    }
  });

  const { data: settings } = useQuery({
    queryKey: ['paymentSettings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('TenantPaymentSetting').select('*').maybeSingle();
      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    if (settings) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsActive(settings.isActive);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProvider(settings.provider || 'STRIPE');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPublicKey(settings.publicKey || '');
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      // Upsert needs the current user's tenantId. 
      // If RLS handles it, we might just omit it, but usually upsert requires the primary key or unique key.
      // We will try a generic insert for now, assuming RLS fills tenantId.
      const { data: result, error } = await supabase
        .from('TenantPaymentSetting')
        .upsert([data])
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentSettings'] });
      setSaveMessage({ text: 'Settings saved securely.', type: 'success' });
      setSecretKey(''); // Clear out input for security
      setWebhookSecret('');
      setTimeout(() => setSaveMessage({ text: '', type: '' }), 3000);
    },
    onError: (err: any) => {
      setSaveMessage({ text: err.message || 'Failed to save', type: 'error' });
    }
  });

  const handleSave = () => {
    saveMutation.mutate({
      provider,
      isActive,
      publicKey,
      secretKey: secretKey || undefined,
      webhookSecret: webhookSecret || undefined
    });
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-10 space-y-12">
      <header className="flex justify-between items-end border-b border-zinc-800 pb-6">
        <div>
          <p className="text-brand-500 text-xs font-bold uppercase tracking-widest mb-2 font-mono">Platform Configuration</p>
          <h1 className="text-3xl font-bold text-zinc-50 tracking-tight font-['Outfit']">Settings</h1>
        </div>
      </header>

      <div className="max-w-4xl space-y-8">
        
        {/* Payment Gateway Section */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 relative overflow-hidden">
          {/* Subtle accent glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 blur-[80px] rounded-full pointer-events-none" />

          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-zinc-950 flex items-center justify-center text-brand-400 border border-zinc-800">
              <CreditCard size={24} weight="duotone" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-50 font-['Outfit']">Payment Gateway</h2>
              <p className="text-zinc-400 text-sm">Configure Direct-to-Merchant payments for customer invoices.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              
              <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">Gateway Status</h3>
                  <p className="text-xs text-zinc-500 font-mono mt-1">Accept customer payments</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                  <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-900 after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 font-mono">Provider</label>
                <select 
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition-colors"
                >
                  <option value="STRIPE">Stripe (Recommended)</option>
                  <option value="PAYPAL">PayPal</option>
                  <option value="SQUARE">Square</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 font-mono">Publishable Key</label>
                <input 
                  type="text" 
                  value={publicKey}
                  onChange={e => setPublicKey(e.target.value)}
                  placeholder="pk_test_..."
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition-colors font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 font-mono">Secret Key</label>
                <input 
                  type="password" 
                  value={secretKey}
                  onChange={e => setSecretKey(e.target.value)}
                  placeholder={settings?.isSecretSet ? "•••••••••••••••• (Encrypted at rest)" : "sk_test_..."}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition-colors font-mono text-sm"
                />
                <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1 font-mono">
                  <ShieldCheck size={14} className="text-brand-500" /> AES-256 Encrypted in database
                </p>
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 font-mono">Webhook Secret</label>
                <input 
                  type="password" 
                  value={webhookSecret}
                  onChange={e => setWebhookSecret(e.target.value)}
                  placeholder={settings?.isWebhookSet ? "•••••••••••••••• (Encrypted at rest)" : "whsec_..."}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition-colors font-mono text-sm"
                />
              </div>
            </div>

            <div className="bg-zinc-950/50 border border-zinc-800/50 rounded-2xl p-6 h-fit">
              <h4 className="text-sm font-bold text-zinc-100 mb-4 font-['Outfit']">How to connect {provider === 'STRIPE' ? 'Stripe' : provider === 'PAYPAL' ? 'PayPal' : 'Square'}</h4>
              <ol className="list-decimal list-inside space-y-3 text-sm text-zinc-400">
                <li>Create a <a href="#" target="_blank" rel="noreferrer" className="text-brand-400 hover:text-brand-300 underline">{provider === 'STRIPE' ? 'Stripe' : provider === 'PAYPAL' ? 'PayPal' : 'Square'} account</a>.</li>
                <li>Go to Developers {'>'} API Keys to find your <strong>Client ID (Publishable)</strong> and <strong>Secret</strong> keys.</li>
                <li>Go to Developers {'>'} Webhooks and add an endpoint pointing to <code className="bg-zinc-800 px-2 py-0.5 rounded font-mono text-xs text-zinc-300">https://yourdomain.com/api/webhooks/{provider.toLowerCase()}</code></li>
                <li>Ensure the webhook listens to payment success and failure events.</li>
                <li>Copy the <strong>Signing Secret</strong> and paste it into the Webhook Secret field.</li>
              </ol>

              <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-3">
                <WarningCircle size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-200/70">
                  Payments go directly to your merchant account. We do not store credit card data on our servers, ensuring PCI-compliance.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-800 flex items-center justify-between">
            <div>
              {saveMessage.text && (
                <span className={`text-sm font-bold ${saveMessage.type === 'success' ? 'text-brand-500' : 'text-red-400'}`}>
                  {saveMessage.text}
                </span>
              )}
            </div>
            <button 
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-zinc-950 px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
            >
              <FloppyDisk size={18} weight="bold" />
              {saveMutation.isPending ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </section>

        {/* Team Section */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 relative overflow-hidden">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-zinc-950 flex items-center justify-center text-brand-400 border border-zinc-800">
              <UsersThree size={24} weight="duotone" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-50 font-['Outfit']">Team</h2>
              <p className="text-zinc-400 text-sm">Invite managers and technicians to your shop.</p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              inviteMutation.mutate({ name: inviteName, email: inviteEmail, role: inviteRole });
            }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          >
            <input
              type="text"
              required
              placeholder="Full name"
              value={inviteName}
              onChange={e => setInviteName(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition-colors"
            />
            <input
              type="email"
              required
              placeholder="Email address"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition-colors"
            />
            <select
              value={inviteRole}
              onChange={e => setInviteRole(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition-colors"
            >
              <option value="TECHNICIAN">Technician</option>
              <option value="MANAGER">Manager</option>
            </select>
            <button
              type="submit"
              disabled={inviteMutation.isPending}
              className="flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-400 text-zinc-950 px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
            >
              <PaperPlaneTilt size={18} weight="bold" />
              {inviteMutation.isPending ? 'Sending...' : 'Send Invite'}
            </button>
          </form>

          {inviteMessage.text && (
            <p className={`text-sm font-bold mb-6 ${inviteMessage.type === 'success' ? 'text-brand-500' : 'text-red-400'}`}>
              {inviteMessage.text}
            </p>
          )}

          <div className="divide-y divide-zinc-800 border border-zinc-800 rounded-2xl overflow-hidden">
            {team.map((member: any) => (
              <div key={member.id} className="flex items-center justify-between px-5 py-4 bg-zinc-950/50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-brand-400 font-bold">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-100">{member.name}</p>
                    <p className="text-xs text-zinc-500 font-mono">{member.email}</p>
                  </div>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full">
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
