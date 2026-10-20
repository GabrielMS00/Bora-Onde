import { PLACE_COLUMNS, toPlace, type PlaceRow } from '@/data/api/placesApi';
import { supabase } from '@/data/supabase';
import type { Place } from '@/data/types';

export async function fetchFavorites(): Promise<Place[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select(`created_at,establishments(${PLACE_COLUMNS})`)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  const rows = data as unknown as { establishments: PlaceRow | PlaceRow[] | null }[];
  return rows.flatMap((row) => {
    const place = Array.isArray(row.establishments) ? row.establishments[0] : row.establishments;
    return place ? [toPlace(place)] : [];
  });
}

export async function addFavorite(uid: string, placeId: string) {
  const { error } = await supabase.from('favorites').upsert({ user_id: uid, establishment_id: placeId }, { ignoreDuplicates: true });
  if (error) throw new Error(error.message);
}

export async function removeFavorite(uid: string, placeId: string) {
  const { error } = await supabase.from('favorites').delete().eq('user_id', uid).eq('establishment_id', placeId);
  if (error) throw new Error(error.message);
}
