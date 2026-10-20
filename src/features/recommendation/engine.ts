import type { Atmosphere, Place, PlaceMetadata, PlaceType, Specialty, Vibe } from '@/data/types';
import { ATMOSPHERES, VIBES, atmosphereLabel, placeTypeLabel, specialtiesByType, specialtyLabel, vibeLabel } from '@/lib/place';

export type QuizAnswers = {
  type: PlaceType | 'any';
  specialty: Specialty | 'any';
  vibe: Vibe;
  atmosphere: Atmosphere | 'any';
  alcohol: 'yes' | 'any';
};

export const WEIGHTS = { specialty: 4, vibe: 2, atmosphere: 1, saved: 0.5 } as const;

const TYPES: QuizAnswers['type'][] = ['restaurant', 'cafe', 'bar', 'any'];
const ALCOHOL: QuizAnswers['alcohol'][] = ['yes', 'any'];
const NONE: ReadonlySet<string> = new Set();

type Params = { type?: string; specialty?: string; vibe?: string; atmosphere?: string; alcohol?: string };

export function parseAnswers(params: Params): QuizAnswers | null {
  const type = params.type as QuizAnswers['type'];
  const specialty = params.specialty as QuizAnswers['specialty'];
  const vibe = params.vibe as Vibe;
  const atmosphere = params.atmosphere as QuizAnswers['atmosphere'];
  const alcohol = params.alcohol as QuizAnswers['alcohol'];

  if (!TYPES.includes(type)) return null;
  const allowed: string[] = type === 'any' ? [] : specialtiesByType[type];
  if (specialty !== 'any' && !allowed.includes(specialty)) return null;
  if (!VIBES.includes(vibe)) return null;
  if (atmosphere !== 'any' && !ATMOSPHERES.includes(atmosphere)) return null;
  if (!ALCOHOL.includes(alcohol)) return null;
  return { type, specialty, vibe, atmosphere, alcohol };
}

type Candidate = Place & { metadata: PlaceMetadata & { type: PlaceType; sellsAlcohol: boolean } };

function isComplete(place: Place): place is Candidate {
  const m = place.metadata;
  return !!m && m.type !== undefined && m.sellsAlcohol !== undefined;
}

function candidates(places: Place[], answers: QuizAnswers): Candidate[] {
  return places
    .filter(isComplete)
    .filter((p) => answers.type === 'any' || p.metadata.type === answers.type)
    .filter((p) => answers.alcohol === 'any' || p.metadata.sellsAlcohol);
}

export function scorePlace(place: Candidate, answers: QuizAnswers, savedIds: ReadonlySet<string> = NONE): number {
  const m = place.metadata;
  let score = 0;
  if (answers.specialty !== 'any' && m.specialties.includes(answers.specialty)) score += WEIGHTS.specialty;
  if (m.vibes.includes(answers.vibe)) score += WEIGHTS.vibe;
  if (answers.atmosphere !== 'any' && m.atmospheres.includes(answers.atmosphere)) score += WEIGHTS.atmosphere;
  if (savedIds.has(place.id)) score += WEIGHTS.saved;
  return score;
}

export function rankPlaces(places: Place[], answers: QuizAnswers, savedIds: ReadonlySet<string> = NONE): Place[] {
  return candidates(places, answers)
    .map((place) => ({ place, score: scorePlace(place, answers, savedIds) }))
    .sort((a, b) => b.score - a.score || a.place.name.localeCompare(b.place.name, 'pt-BR'))
    .map(({ place }) => place);
}

export function recommend(
  places: Place[],
  answers: QuizAnswers,
  excludeIds: readonly string[] = [],
  savedIds: ReadonlySet<string> = NONE,
): Place | null {
  return rankPlaces(places, answers, savedIds).find((p) => !excludeIds.includes(p.id)) ?? null;
}

export function missingSpecialty(places: Place[], answers: QuizAnswers): Specialty | null {
  const { specialty } = answers;
  if (specialty === 'any') return null;
  return candidates(places, answers).some((p) => p.metadata.specialties.includes(specialty)) ? null : specialty;
}

export type Criterion = { label: string; met: boolean };

function requested(answers: QuizAnswers): { label: string; test: (m: PlaceMetadata) => boolean }[] {
  const list: { label: string; test: (m: PlaceMetadata) => boolean }[] = [];
  const { type, specialty, vibe, atmosphere, alcohol } = answers;
  if (type !== 'any') list.push({ label: placeTypeLabel[type], test: (m) => m.type === type });
  if (specialty !== 'any') list.push({ label: specialtyLabel[specialty], test: (m) => m.specialties.includes(specialty) });
  list.push({ label: vibeLabel[vibe], test: (m) => m.vibes.includes(vibe) });
  if (atmosphere !== 'any') list.push({ label: atmosphereLabel[atmosphere], test: (m) => m.atmospheres.includes(atmosphere) });
  if (alcohol === 'yes') list.push({ label: 'Com álcool', test: (m) => m.sellsAlcohol === true });
  return list;
}

export function matchCriteria(place: Place, answers: QuizAnswers): Criterion[] {
  return requested(answers).map(({ label, test }) => ({ label, met: !!place.metadata && test(place.metadata) }));
}

export function describeAnswers(answers: QuizAnswers): string {
  return requested(answers)
    .map((c) => c.label)
    .join(' · ');
}
