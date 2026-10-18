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

// Hashtags em CamelCase com acento (manual da marca).
const vibeTag: Record<Vibe, string> = {
  family: '#Familiar',
  friends: '#ComAmigos',
  romantic: '#Romântico',
};

export function formatCep(digits: string): string {
  const d = digits.replace(/\D/g, '').slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

/** "Rua Maria Monteiro, 820 · Cambuí, Campinas/SP · 13025-151" */
export function formatAddress(place: Place): string {
  const cityState = place.city.replace(/,\s*/, '/');
  return `${place.street}, ${place.number} · ${place.neighborhood}, ${cityState} · ${formatCep(place.cep)}`;
}

/** "Bar · Cambuí" — sem o tipo, só o bairro (lugar sem Dados Extras). */
export function formatMeta(place: Place): string {
  const type = place.metadata?.type;
  return type ? `${placeTypeLabel[type]} · ${place.neighborhood}` : place.neighborhood;
}

export type PlaceTag = { label: string; type?: PlaceType };

/** Até 3 tags: tipo, depois vibes, depois álcool. Vazio se o lugar ainda não tem Dados Extras. */
export function placeTags(place: Place): PlaceTag[] {
  const meta = place.metadata;
  if (!meta) return [];
  const tags: PlaceTag[] = [];
  if (meta.type) tags.push({ label: placeTypeLabel[meta.type], type: meta.type });
  for (const vibe of meta.vibes) tags.push({ label: vibeTag[vibe] });
  if (meta.sellsAlcohol) tags.push({ label: '#ComÁlcool' });
  return tags.slice(0, 3);
}
