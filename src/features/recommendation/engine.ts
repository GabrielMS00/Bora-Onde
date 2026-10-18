import type { Place, PlaceType, Vibe } from '@/data/types';
import { placeTypeLabel, vibeLabel } from '@/lib/place';

// Motor de indicação: função pura, sem rede nem estado (por isso é testada em engine.test.ts).
// Recebe os lugares da cidade do usuário e as 3 respostas do questionário (2.2) e devolve os candidatos em ordem.

export type QuizAnswers = {
  /** Pergunta 1. "any" = "Tanto faz". */
  type: PlaceType | 'any';
  /** Pergunta 2: a vibe do rolê. */
  vibe: Vibe;
  /** Pergunta 3. "any" = "Não / Tanto faz". */
  alcohol: 'yes' | 'any';
};

const TYPES: QuizAnswers['type'][] = ['restaurant', 'cafe', 'bar', 'any'];
const VIBES: Vibe[] = ['family', 'friends', 'romantic'];
const ALCOHOL: QuizAnswers['alcohol'][] = ['yes', 'any'];

/** Lê as respostas dos parâmetros da rota (strings da URL). Devolve null se faltar algo ou vier inválido. */
export function parseAnswers(params: { type?: string; vibe?: string; alcohol?: string }): QuizAnswers | null {
  const { type, vibe, alcohol } = params;
  if (!TYPES.includes(type as QuizAnswers['type'])) return null;
  if (!VIBES.includes(vibe as Vibe)) return null;
  if (!ALCOHOL.includes(alcohol as QuizAnswers['alcohol'])) return null;
  return { type: type as QuizAnswers['type'], vibe: vibe as Vibe, alcohol: alcohol as QuizAnswers['alcohol'] };
}

/** Só entra na indicação quem já preencheu os Dados Extras (tipo e venda de álcool). */
function isComplete(place: Place): place is Place & { metadata: NonNullable<Place['metadata']> } {
  const m = place.metadata;
  return !!m && m.type !== undefined && m.sellsAlcohol !== undefined;
}

/**
 * Candidatos em ordem de preferência.
 *  1. Filtros duros: tipo (se escolhido) e venda de álcool (se for requisito).
 *  2. A vibe é critério suave: quem a atende vem antes dos demais.
 *  3. Empate: ordem alfabética do nome (determinístico).
 */
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

/** Primeiro candidato que ainda não foi mostrado ("Tentar outra indicação" acumula os ids em `excludeIds`). */
export function recommend(places: Place[], answers: QuizAnswers, excludeIds: readonly string[] = []): Place | null {
  return rankPlaces(places, answers).find((p) => !excludeIds.includes(p.id)) ?? null;
}

/** Texto "Com base em: …" — só as respostas que de fato restringem, ex.: "Bar · Com amigos · Com álcool". */
export function describeAnswers(answers: QuizAnswers): string {
  const parts: string[] = [];
  if (answers.type !== 'any') parts.push(placeTypeLabel[answers.type]);
  parts.push(vibeLabel[answers.vibe]);
  if (answers.alcohol === 'yes') parts.push('Com álcool');
  return parts.join(' · ');
}
