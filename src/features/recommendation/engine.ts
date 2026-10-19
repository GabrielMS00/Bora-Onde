import type { Place, PlaceType, Vibe } from '@/data/types';
import { placeTypeLabel, vibeLabel } from '@/lib/place';

export type QuizAnswers = {
  type: PlaceType | 'any';
  vibe: Vibe;
  alcohol: 'yes' | 'any';
};

const TYPES: QuizAnswers['type'][] = ['restaurant', 'cafe', 'bar', 'any'];
const VIBES: Vibe[] = ['family', 'friends', 'romantic'];
const ALCOHOL: QuizAnswers['alcohol'][] = ['yes', 'any'];

export function parseAnswers(params: { type?: string; vibe?: string; alcohol?: string }): QuizAnswers | null {
  const { type, vibe, alcohol } = params;
  if (!TYPES.includes(type as QuizAnswers['type'])) return null;
  if (!VIBES.includes(vibe as Vibe)) return null;
  if (!ALCOHOL.includes(alcohol as QuizAnswers['alcohol'])) return null;
  return { type: type as QuizAnswers['type'], vibe: vibe as Vibe, alcohol: alcohol as QuizAnswers['alcohol'] };
}

function isComplete(place: Place): place is Place & { metadata: NonNullable<Place['metadata']> } {
  const m = place.metadata;
  return !!m && m.type !== undefined && m.sellsAlcohol !== undefined;
}

export function rankPlaces(places: Place[], answers: QuizAnswers): Place[] {
  return places
    .filter(isComplete)
    .filter((p) => answers.type === 'any' || p.metadata.type === answers.type)
    .filter((p) => answers.alcohol === 'any' || p.metadata.sellsAlcohol === true)
    .sort((a, b) => {
      const byVibe = Number(b.metadata.vibes.includes(answers.vibe)) - Number(a.metadata.vibes.includes(answers.vibe));
      return byVibe !== 0 ? byVibe : a.name.localeCompare(b.name, 'pt-BR');
    });
}

export function recommend(places: Place[], answers: QuizAnswers, excludeIds: readonly string[] = []): Place | null {
  return rankPlaces(places, answers).find((p) => !excludeIds.includes(p.id)) ?? null;
}

export function describeAnswers(answers: QuizAnswers): string {
  const parts: string[] = [];
  if (answers.type !== 'any') parts.push(placeTypeLabel[answers.type]);
  parts.push(vibeLabel[answers.vibe]);
  if (answers.alcohol === 'yes') parts.push('Com álcool');
  return parts.join(' · ');
}
