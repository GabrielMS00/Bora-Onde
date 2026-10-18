import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export type Role = 'user' | 'establishment';
export type Session = { role: Role; accountId: string };

type SessionContextValue = {
  session: Session | null;
  /** MOCK (Fase 2): entra direto com um papel. A Fase 3 troca por Supabase Auth mantendo `session`/`signOut`. */
  signInAs: (role: Role) => void;
  signOut: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);

  const signInAs = useCallback((role: Role) => setSession({ role, accountId: `mock-${role}` }), []);
  const signOut = useCallback(() => setSession(null), []);

  const value = useMemo(() => ({ session, signInAs, signOut }), [session, signInAs, signOut]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession deve ser usado dentro de <SessionProvider>');
  return ctx;
}
