import { describe, expect, it } from '@jest/globals';

import type { Place, PlaceMetadata } from '@/data/types';

import { describeAnswers, parseAnswers, rankPlaces, recommend, type QuizAnswers } from './engine';

const place = (id: string, name: string, metadata?: PlaceMetadata): Place => ({
  id,
  name,
  photos: [],
  cep: '70239510',
  city: 'Brasília, DF',
  neighborhood: 'Asa Sul',
  street: 'Rua Teste',
  number: '1',
  metadata,
});

// Espelha o seed de Brasília.
const barDoZe = place('bar-do-ze', 'Bar do Zé', { type: 'bar', vibes: ['friends', 'romantic'], sellsAlcohol: true });
const boteco = place('boteco', 'Boteco Esquina', { type: 'bar', vibes: ['friends'], sellsAlcohol: true });
const cafe = place('cafe', 'Café Grão Fino', { type: 'cafe', vibes: ['family', 'friends'], sellsAlcohol: false });
const cantina = place('cantina', 'Cantina da Nonna', { type: 'restaurant', vibes: ['family', 'romantic'], sellsAlcohol: true });
const all = [cantina, cafe, boteco, barDoZe]; // fora de ordem de propósito

const ids = (list: Place[]) => list.map((p) => p.id);
const answers = (a: Partial<QuizAnswers> = {}): QuizAnswers => ({ type: 'any', vibe: 'friends', alcohol: 'any', ...a });

describe('rankPlaces', () => {
  it('filtra pelo tipo escolhido', () => {
    expect(ids(rankPlaces(all, answers({ type: 'bar' })))).toEqual(['bar-do-ze', 'boteco']);
    expect(ids(rankPlaces(all, answers({ type: 'cafe' })))).toEqual(['cafe']);
  });

  it('"Tanto faz" no tipo considera todos os tipos', () => {
    expect(rankPlaces(all, answers({ type: 'any' }))).toHaveLength(4);
  });

  it('exige venda de álcool só quando a resposta é "sim"', () => {
    expect(ids(rankPlaces(all, answers({ alcohol: 'yes' })))).not.toContain('cafe');
    expect(ids(rankPlaces(all, answers({ alcohol: 'any' })))).toContain('cafe');
  });

  it('a vibe é critério suave: quem a atende vem antes, mas os outros continuam candidatos', () => {
    // vibe "family": café e cantina primeiro; os bares (sem família) depois.
    expect(ids(rankPlaces(all, answers({ vibe: 'family' })))).toEqual(['cafe', 'cantina', 'bar-do-ze', 'boteco']);
  });

  it('desempata pelo nome (determinístico, independe da ordem de entrada)', () => {
    const shuffled = [boteco, barDoZe];
    expect(ids(rankPlaces(shuffled, answers({ type: 'bar', vibe: 'friends' })))).toEqual(['bar-do-ze', 'boteco']);
    expect(ids(rankPlaces([...shuffled].reverse(), answers({ type: 'bar', vibe: 'friends' })))).toEqual(['bar-do-ze', 'boteco']);
  });

  it('ignora lugares sem Dados Extras ou com Dados Extras incompletos', () => {
    const semDados = place('novo', 'Aberto Agora');
    const semTipo = place('sem-tipo', 'Sem Tipo', { vibes: ['friends'], sellsAlcohol: true });
    const semAlcool = place('sem-alcool', 'Sem Álcool Definido', { type: 'bar', vibes: ['friends'] });
    expect(rankPlaces([semDados, semTipo, semAlcool], answers())).toEqual([]);
  });

  it('não altera a lista recebida', () => {
    const input = [...all];
    rankPlaces(input, answers());
    expect(ids(input)).toEqual(ids(all));
  });
});

describe('recommend', () => {
  it('quiz Bar + Com amigos + Com álcool indica o Bar do Zé (jornada de demonstração)', () => {
    expect(recommend(all, { type: 'bar', vibe: 'friends', alcohol: 'yes' })?.id).toBe('bar-do-ze');
  });

  it('"Tentar outra indicação" avança para o próximo candidato e esgota em null', () => {
    const a: QuizAnswers = { type: 'bar', vibe: 'friends', alcohol: 'yes' };
    const first = recommend(all, a);
    const second = recommend(all, a, [first!.id]);
    expect(second?.id).toBe('boteco');
    expect(recommend(all, a, [first!.id, second!.id])).toBeNull();
  });

  it('devolve null quando nenhum lugar atende os filtros duros', () => {
    expect(recommend(all, { type: 'cafe', vibe: 'friends', alcohol: 'yes' })).toBeNull();
    expect(recommend([], answers())).toBeNull();
  });
});

describe('parseAnswers', () => {
  it('aceita respostas válidas vindas da rota', () => {
    expect(parseAnswers({ type: 'bar', vibe: 'friends', alcohol: 'yes' })).toEqual({ type: 'bar', vibe: 'friends', alcohol: 'yes' });
    expect(parseAnswers({ type: 'any', vibe: 'family', alcohol: 'any' })?.type).toBe('any');
  });

  it('rejeita parâmetros ausentes ou inválidos (URL adulterada)', () => {
    expect(parseAnswers({})).toBeNull();
    expect(parseAnswers({ type: 'bar', vibe: 'friends' })).toBeNull();
    expect(parseAnswers({ type: 'pizzaria', vibe: 'friends', alcohol: 'yes' })).toBeNull();
    expect(parseAnswers({ type: 'bar', vibe: 'friends', alcohol: 'no' })).toBeNull();
  });
});

describe('describeAnswers', () => {
  it('lista só o que restringe', () => {
    expect(describeAnswers({ type: 'bar', vibe: 'friends', alcohol: 'yes' })).toBe('Bar · Com amigos · Com álcool');
    expect(describeAnswers({ type: 'any', vibe: 'romantic', alcohol: 'any' })).toBe('Encontro romântico');
  });
});
