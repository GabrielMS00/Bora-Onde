import type { Place, PlaceType, Vibe } from '@/data/types';
import { placeTypeLabel } from '@/lib/place';

export type FeedFilters = { type: PlaceType | null; vibe: Vibe | null; alcohol: boolean };

export const NO_FILTERS: FeedFilters = { type: null, vibe: null, alcohol: false };

export const hasFilters = (f: FeedFilters) => f.type !== null || f.vibe !== null || f.alcohol;

export function filterPlaces(places: Place[], f: FeedFilters): Place[] {
  if (!hasFilters(f)) return places;
  return places.filter((p) => {
    const m = p.metadata;
    if (!m) return false;
    if (f.type && m.type !== f.type) return false;
    if (f.vibe && !m.vibes.includes(f.vibe)) return false;
    if (f.alcohol && m.sellsAlcohol !== true) return false;
    return true;
  });
}

export function resultLabel(f: FeedFilters, count: number): string {
  const noun = `${count} ${count === 1 ? 'lugar' : 'lugares'}`;
  return f.type ? `${noun} do tipo ${placeTypeLabel[f.type]}` : noun;
}
