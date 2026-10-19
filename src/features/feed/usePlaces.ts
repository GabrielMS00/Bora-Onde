import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { fetchPlacesByCity } from '@/data/api/placesApi';
import { photoUrl } from '@/data/supabase';
import type { Place } from '@/data/types';

export function usePlaces(city: string | undefined) {
  const query = useQuery({
    queryKey: ['places', city],
    queryFn: () => fetchPlacesByCity(city!),
    enabled: !!city,
  });

  const places = useMemo<Place[] | undefined>(
    () => query.data?.map((p) => ({ ...p, photos: p.photos.map(photoUrl) })),
    [query.data],
  );

  return { ...query, places };
}
