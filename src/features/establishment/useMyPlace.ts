import { useQuery } from '@tanstack/react-query';

import { fetchMyPlace } from '@/data/api/placesApi';
import { useSession } from '@/features/auth/session';

/** O lugar do estabelecimento logado (undefined enquanto carrega). */
export function useMyPlace() {
  const { session } = useSession();
  return useQuery({
    queryKey: ['my-place', session?.accountId],
    queryFn: () => fetchMyPlace(session!.accountId),
    enabled: session?.role === 'establishment',
  });
}
