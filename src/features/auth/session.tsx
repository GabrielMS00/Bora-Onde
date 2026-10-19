import type { Session as SupabaseSession } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { supabase } from '@/data/supabase';

import { signOut } from './authApi';

export type Role = 'user' | 'establishment';
export type Session = { role: Role; accountId: string; email: string };

type SessionContextValue = {
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  withSessionHeld: <T>(fn: () => Promise<T>) => Promise<T>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

function toSession(s: SupabaseSession | null): Session | null {
  if (!s) return null;
  const role: Role = s.user.user_metadata?.role === 'establishment' ? 'establishment' : 'user';
  return { role, accountId: s.user.id, email: s.user.email ?? '' };
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [realSession, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(toSession(data.session));
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(toSession(next));
      setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const withSessionHeld = useCallback(async <T,>(fn: () => Promise<T>): Promise<T> => {
    setHeld(true);
    try {
      return await fn();
    } finally {
      setHeld(false);
    }
  }, []);

  const session = held ? null : realSession;
  const value = useMemo(() => ({ session, loading, signOut, withSessionHeld }), [session, loading, withSessionHeld]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession deve ser usado dentro de <SessionProvider>');
  return ctx;
}
