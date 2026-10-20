import type { Atmosphere, Place, PlaceType, Specialty, Vibe } from '@/data/types';

export const placeTypeLabel: Record<PlaceType, string> = {
  restaurant: 'Restaurante',
  cafe: 'Cafeteria',
  bar: 'Bar',
};

export const VIBES: Vibe[] = ['solo', 'romantic', 'friends', 'family', 'work', 'group'];

export const vibeLabel: Record<Vibe, string> = {
  solo: 'Sozinho(a)',
  romantic: 'A dois',
  friends: 'Com amigos',
  family: 'Em família',
  work: 'Trabalho',
  group: 'Grupo grande / comemoração',
};

const vibeTag: Record<Vibe, string> = {
  solo: '#Sozinho',
  romantic: '#ADois',
  friends: '#ComAmigos',
  family: '#EmFamília',
  work: '#Trabalho',
  group: '#GrupoGrande',
};

export const specialtiesByType: Record<PlaceType, Specialty[]> = {
  restaurant: ['brazilian', 'italian', 'japanese', 'mexican', 'arab', 'burger'],
  bar: ['pub', 'brewery', 'cocktails', 'wine'],
  cafe: ['specialty_coffee', 'bakery', 'sweets'],
};

export const specialtyQuestion: Record<PlaceType, string> = {
  restaurant: 'Que tipo de comida?',
  bar: 'Que tipo de bar?',
  cafe: 'Que tipo de café?',
};

export const specialtyLabel: Record<Specialty, string> = {
  brazilian: 'Brasileira',
  italian: 'Italiana',
  japanese: 'Japonesa',
  mexican: 'Mexicana',
  arab: 'Árabe',
  burger: 'Hambúrguer',
  pub: 'Boteco',
  brewery: 'Cervejaria',
  cocktails: 'Drinks',
  wine: 'Vinhos',
  specialty_coffee: 'Café especial',
  bakery: 'Padaria / brunch',
  sweets: 'Doceria',
};

export const specialtyPhrase: Record<Specialty, string> = {
  brazilian: 'comida brasileira',
  italian: 'comida italiana',
  japanese: 'comida japonesa',
  mexican: 'comida mexicana',
  arab: 'comida árabe',
  burger: 'hamburgueria',
  pub: 'boteco',
  brewery: 'cervejaria',
  cocktails: 'bar de drinks',
  wine: 'bar de vinhos',
  specialty_coffee: 'café especial',
  bakery: 'padaria ou brunch',
  sweets: 'doceria',
};

export const ATMOSPHERES: Atmosphere[] = ['calm', 'lively', 'outdoor'];

export const atmosphereLabel: Record<Atmosphere, string> = {
  calm: 'Tranquilo pra conversar',
  lively: 'Animado',
  outdoor: 'Ao ar livre',
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
  const [specialty] = meta.specialties;
  const tags: PlaceTag[] = [];
  if (meta.type) tags.push({ label: specialty ? specialtyLabel[specialty] : placeTypeLabel[meta.type], type: meta.type });
  if (firstVibe) tags.push({ label: vibeTag[firstVibe] });
  if (meta.sellsAlcohol) tags.push({ label: '#ComÁlcool' });
  for (const vibe of otherVibes) tags.push({ label: vibeTag[vibe] });
  return tags.slice(0, 3);
}
