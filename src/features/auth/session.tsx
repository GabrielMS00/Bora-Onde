import type { Session as SupabaseSession } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { supabase } from '@/data/supabase';

import { signOut } from './authApi';

export type Role = 'user' | 'establishment';
export type Session = { role: Role; accountId: string; email: string };

type SessionContextValue = {
  session: Session | null;
  /** true até o Supabase restaurar (ou descartar) a sessão salva no aparelho. */
  loading: boolean;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

// O papel é gravado em user_metadata.role no cadastro. Serve só para escolher o fluxo de telas: o que cada papel
// pode ler/escrever é decidido pelo banco (RLS), não por este valor.
function toSession(s: SupabaseSession | null): Session | null {
  if (!s) return null;
  const role: Role = s.user.user_metadata?.role === 'establishment' ? 'establishment' : 'user';
  return { role, accountId: s.user.id, email: s.user.email ?? '' };
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(toSession(data.session));
      setLoading(false);
    });

    // Importante: o callback só atualiza estado (chamar o supabase aqui dentro pode travar o cliente).
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(toSession(next));
      setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const value = useMemo(() => ({ session, loading, signOut }), [session, loading]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession deve ser usado dentro de <SessionProvider>');
  return ctx;
}
