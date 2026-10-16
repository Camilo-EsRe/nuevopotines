import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AdminCombos } from './AdminCombos';
import { AdminBebidas } from './AdminBebidas';
import { AdminAdiciones } from './AdminAdiciones';
import { AdminSalsas } from './AdminSalsas';
import { AdminDomicilios } from './AdminDomicilios';
import { AdminLogin } from './AdminLogin';
import { LogOut, Loader2, UtensilsCrossed, CupSoda, Plus, Droplet, Truck } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';

type Tab = 'combos' | 'bebidas' | 'adiciones' | 'salsas' | 'domicilios';

const TABS: { id: Tab; label: string; icon: typeof UtensilsCrossed }[] = [
  { id: 'combos', label: 'Combos', icon: UtensilsCrossed },
  { id: 'bebidas', label: 'Bebidas', icon: CupSoda },
  { id: 'adiciones', label: 'Adiciones', icon: Plus },
  { id: 'salsas', label: 'Salsas', icon: Droplet },
  { id: 'domicilios', label: 'Domicilios', icon: Truck },
];

export function AdminPanel() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('combos');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, sess) => {
      setSession(sess);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <AdminLogin onLogin={() => supabase.auth.getSession().then(({ data }) => setSession(data.session))} />;
  }

  return (
    <div className="min-h-screen bg-ink-900">
      <div className="sticky top-0 z-30 bg-ink-900/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0">
                <img src="/potines.png" alt="POTINES" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-base font-bold gold-text leading-tight">POTINES</h1>
                <p className="text-[10px] text-white/40 leading-tight">Panel de administracion</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-9 h-9 rounded-xl bg-ink-700/60 flex items-center justify-center text-white/60 transition-all active:scale-90 hover:text-red-400"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all active:scale-95 flex items-center gap-1.5 ${
                    tab === t.id
                      ? 'bg-gold-500 text-ink-900'
                      : 'bg-ink-700/60 text-white/50 hover:text-white/80'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-5">
        {tab === 'combos' && <AdminCombos />}
        {tab === 'bebidas' && <AdminBebidas />}
        {tab === 'adiciones' && <AdminAdiciones />}
        {tab === 'salsas' && <AdminSalsas />}
        {tab === 'domicilios' && <AdminDomicilios />}
      </div>
    </div>
  );
}
