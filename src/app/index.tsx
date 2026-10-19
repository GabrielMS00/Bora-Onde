import { Redirect } from 'expo-router';

import { useSession } from '@/features/auth/session';

export default function Index() {
  const { session } = useSession();

  if (!session) return <Redirect href="/login" />;
  return <Redirect href={session.role === 'user' ? '/feed' : '/region-feed'} />;
}
