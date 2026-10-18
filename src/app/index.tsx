import { Redirect } from 'expo-router';

import { useSession } from '@/features/auth/session';

// Ponto de entrada: manda para o fluxo do papel da sessão (ou para o login).
export default function Index() {
  const { session } = useSession();

  if (!session) return <Redirect href="/login" />;
  return <Redirect href={session.role === 'user' ? '/feed' : '/region-feed'} />;
}
