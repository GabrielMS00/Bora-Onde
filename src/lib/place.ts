import type { Place, PlaceType, Vibe } from '@/data/types';

export const placeTypeLabel: Record<PlaceType, string> = {
  restaurant: 'Restaurante',
  cafe: 'Cafeteria',
  bar: 'Bar',
};

export const vibeLabel: Record<Vibe, string> = {
  family: 'Familiar',
  friends: 'Com amigos',
  romantic: 'Encontro romântico',
};

const vibeTag: Record<Vibe, string> = {
  family: '#Familiar',
  friends: '#ComAmigos',
  romantic: '#Romântico',
};

export function formatCep(digits: string): string {
  const d = digits.replace(/\D/g, '').slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

export function formatAddress(place: Place): string {
  const cityState = place.city.replace(/,\s*/, '/');
  return `${place.street}, ${place.number} · ${place.neighborhood}, ${cityState} · ${formatCep(place.cep)}`;
}

export function formatMeta(place: Place): string {
  const type = place.metadata?.type;
  return type ? `${placeTypeLabel[type]} · ${place.neighborhood}` : place.neighborhood;
}

export type PlaceTag = { label: string; type?: PlaceType };

export function placeTags(place: Place): PlaceTag[] {
  const meta = place.metadata;
  if (!meta) return [];
  const [firstVibe, ...otherVibes] = meta.vibes;
  const tags: PlaceTag[] = [];
  if (meta.type) tags.push({ label: placeTypeLabel[meta.type], type: meta.type });
  if (firstVibe) tags.push({ label: vibeTag[firstVibe] });
  if (meta.sellsAlcohol) tags.push({ label: '#ComÁlcool' });
  for (const vibe of otherVibes) tags.push({ label: vibeTag[vibe] });
  return tags.slice(0, 3);
}
