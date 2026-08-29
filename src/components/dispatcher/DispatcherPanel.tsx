import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { DispatcherLogin } from './DispatcherLogin';
import { DispatcherDashboard } from './DispatcherDashboard';
import type { Session } from '@supabase/supabase-js';

export function DispatcherPanel() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, sess) => {
      (async () => {
        setSession(sess);
      })();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <DispatcherLogin
        onLogin={async () => {
          const { data } = await supabase.auth.getSession();
          setSession(data.session);
        }}
      />
    );
  }

  return (
    <DispatcherDashboard
      onLogout={() => {
        setSession(null);
      }}
    />
  );
}
