import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { useToast } from '@/components/ui/Toast';
import { useSession } from '@/features/auth/session';

import { updateMyCity, type UserProfile } from './profileApi';

export function useChangeCity() {
  const { session } = useSession();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  const changeCity = async (city: string) => {
    if (!session) return;
    const key = ['my-user', session.accountId];
    const previous = queryClient.getQueryData<UserProfile>(key);
    if (!previous || previous.city === city) return;

    queryClient.setQueryData<UserProfile>(key, { ...previous, city });
    setSaving(true);
    try {
      await updateMyCity(session.accountId, city);
      await queryClient.invalidateQueries({ queryKey: ['my-user'] });
      toast.show('success', `Alterações salvas. Seu feed agora mostra os lugares de ${city.split(',')[0]}.`);
    } catch {
      queryClient.setQueryData<UserProfile>(key, previous);
      toast.show('error', 'Não foi possível trocar a cidade. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return { changeCity, saving };
}
