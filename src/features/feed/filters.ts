import type { Place, PlaceType, Vibe } from '@/data/types';
import { placeTypeLabel } from '@/lib/place';

export type FeedFilters = { type: PlaceType | null; vibe: Vibe | null; alcohol: boolean };

export const NO_FILTERS: FeedFilters = { type: null, vibe: null, alcohol: false };

export const hasFilters = (f: FeedFilters) => f.type !== null || f.vibe !== null || f.alcohol;

/** AND entre os filtros ativos. Lugar sem Dados Extras só aparece com os filtros zerados. */
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

/** "2 lugares do tipo Bar" / "3 lugares" / "1 lugar". */
export function resultLabel(f: FeedFilters, count: number): string {
  const noun = `${count} ${count === 1 ? 'lugar' : 'lugares'}`;
  return f.type ? `${noun} do tipo ${placeTypeLabel[f.type]}` : noun;
}
