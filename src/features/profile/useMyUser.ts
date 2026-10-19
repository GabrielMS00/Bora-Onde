import { useQuery } from '@tanstack/react-query';

import { useSession } from '@/features/auth/session';

import { fetchMyUser } from './profileApi';

export function useMyUser() {
  const { session } = useSession();
  return useQuery({
    queryKey: ['my-user', session?.accountId],
    queryFn: () => fetchMyUser(session!.accountId),
    enabled: session?.role === 'user',
  });
}
