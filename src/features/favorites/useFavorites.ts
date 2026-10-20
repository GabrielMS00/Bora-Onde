import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useToast } from '@/components/ui/Toast';
import { fetchPlaceById } from '@/data/api/placesApi';
import { photoUrl } from '@/data/supabase';
import type { Place } from '@/data/types';
import { useSession } from '@/features/auth/session';

import { addFavorite, fetchFavorites, removeFavorite } from './favoritesApi';

const withPhotoUrls = (place: Place): Place => ({ ...place, photos: place.photos.map(photoUrl) });

export function useFavorites() {
  const { session } = useSession();
  const query = useQuery({
    queryKey: ['favorites', session?.accountId],
    queryFn: async () => (await fetchFavorites()).map(withPhotoUrls),
    enabled: session?.role === 'user',
  });
  const savedIds = useMemo(() => new Set(query.data?.map((p) => p.id)), [query.data]);
  return { ...query, savedIds };
}

export function useToggleFavorite() {
  const { session } = useSession();
  const queryClient = useQueryClient();
  const toast = useToast();
  const key = ['favorites', session?.accountId];

  const mutation = useMutation({
    mutationFn: ({ place, save }: { place: Place; save: boolean }) =>
      save ? addFavorite(session!.accountId, place.id) : removeFavorite(session!.accountId, place.id),
    onMutate: async ({ place, save }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Place[]>(key);
      queryClient.setQueryData<Place[]>(key, (list = []) => {
        const others = list.filter((p) => p.id !== place.id);
        return save ? [place, ...others] : others;
      });
      return { previous };
    },
    onError: (_error, { save }, context) => {
      queryClient.setQueryData(key, context?.previous);
      toast.show('error', save ? 'Não foi possível salvar o lugar. Tente novamente.' : 'Não foi possível remover o lugar dos salvos. Tente novamente.');
    },
    onSuccess: (_data, { place, save }) => {
      toast.show('success', save ? `${place.name} foi salvo nos seus favoritos.` : `${place.name} foi removido dos salvos.`);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });

  return (place: Place, saved: boolean) => {
    if (session?.role !== 'user') return;
    mutation.mutate({ place, save: !saved });
  };
}

export function useSavedPlace(id: string | undefined) {
  const { session } = useSession();
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ['place', id],
    queryFn: async () => withPhotoUrls(await fetchPlaceById(id!)),
    enabled: !!id && session?.role === 'user',
    placeholderData: () => queryClient.getQueryData<Place[]>(['favorites', session?.accountId])?.find((p) => p.id === id),
  });
}
