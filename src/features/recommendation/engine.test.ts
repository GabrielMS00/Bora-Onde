import { describe, expect, it } from '@jest/globals';

import type { Place, PlaceMetadata } from '@/data/types';

import { describeAnswers, matchCriteria, missingSpecialty, parseAnswers, rankPlaces, recommend, type QuizAnswers } from './engine';

const place = (id: string, name: string, metadata?: Partial<PlaceMetadata>): Place => ({
  id,
  name,
  photos: [],
  cep: '70239510',
  city: 'Brasília, DF',
  neighborhood: 'Asa Sul',
  street: 'Rua Teste',
  number: '1',
  metadata: metadata ? { specialties: [], vibes: [], atmospheres: [], ...metadata } : undefined,
});

const barDoZe = place('bar-do-ze', 'Bar do Zé', { type: 'bar', specialties: ['cocktails'], vibes: ['friends', 'romantic'], atmospheres: ['lively'], sellsAlcohol: true });
const boteco = place('boteco', 'Boteco Esquina', { type: 'bar', specialties: ['pub', 'brewery'], vibes: ['friends', 'group'], atmospheres: ['lively', 'outdoor'], sellsAlcohol: true });
const cafe = place('cafe', 'Café Grão Fino', { type: 'cafe', specialties: ['specialty_coffee'], vibes: ['family', 'friends'], atmospheres: ['calm'], sellsAlcohol: false });
const cantina = place('cantina', 'Cantina da Nonna', { type: 'restaurant', specialties: ['italian'], vibes: ['family', 'romantic'], atmospheres: ['calm'], sellsAlcohol: true });
const sakura = place('sakura', 'Sakura Sushi Bar', { type: 'restaurant', specialties: ['japanese'], vibes: ['romantic'], atmospheres: ['calm'], sellsAlcohol: true });
const raizes = place('raizes', 'Raízes', { type: 'restaurant', specialties: ['brazilian'], vibes: ['friends', 'family'], atmospheres: ['lively'], sellsAlcohol: true });
const all = [cantina, cafe, boteco, barDoZe];
const restaurants = [cantina, sakura, raizes];

const ids = (list: Place[]) => list.map((p) => p.id);
const answers = (a: Partial<QuizAnswers> = {}): QuizAnswers => ({
  type: 'any',
  specialty: 'any',
  vibe: 'friends',
  atmosphere: 'any',
  alcohol: 'any',
  ...a,
});

describe('rankPlaces — filtros obrigatórios', () => {
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

  it('ignora lugares sem Dados Extras ou com Dados Extras incompletos', () => {
    const semDados = place('novo', 'Aberto Agora');
    const semTipo = place('sem-tipo', 'Sem Tipo', { vibes: ['friends'], sellsAlcohol: true });
    const semAlcool = place('sem-alcool', 'Sem Álcool Definido', { type: 'bar', vibes: ['friends'] });
    expect(rankPlaces([semDados, semTipo, semAlcool], answers())).toEqual([]);
  });
});

describe('rankPlaces — pontuação', () => {
  it('a especialidade pesa mais que companhia e clima juntos', () => {
    const a = answers({ type: 'restaurant', specialty: 'japanese', vibe: 'friends', atmosphere: 'lively' });
    expect(ids(rankPlaces(restaurants, a))[0]).toBe('sakura');
  });

  it('a companhia pesa mais que o clima', () => {
    const a = answers({ type: 'restaurant', vibe: 'family', atmosphere: 'lively' });
    expect(ids(rankPlaces([cantina, sakura], a))).toEqual(['cantina', 'sakura']);
    expect(ids(rankPlaces([raizes, cantina], answers({ type: 'restaurant', vibe: 'romantic', atmosphere: 'lively' })))[0]).toBe('cantina');
  });

  it('o clima soma ponto e desempata quem atende a mesma companhia', () => {
    const a = answers({ type: 'restaurant', vibe: 'romantic', atmosphere: 'calm' });
    const semClima = place('x', 'Aaa Bistrô', { type: 'restaurant', vibes: ['romantic'], atmospheres: ['lively'], sellsAlcohol: true });
    expect(ids(rankPlaces([semClima, sakura], a))).toEqual(['sakura', 'x']);
  });

  it('critérios suaves não excluem: quem não atende continua candidato, só vem depois', () => {
    expect(ids(rankPlaces(all, answers({ vibe: 'family' })))).toEqual(['cafe', 'cantina', 'bar-do-ze', 'boteco']);
  });

  it('lugar salvo só desempata, nunca passa na frente de quem atende mais critérios', () => {
    const a = answers({ type: 'bar', vibe: 'friends' });
    expect(ids(rankPlaces([barDoZe, boteco], a, new Set(['boteco'])))).toEqual(['boteco', 'bar-do-ze']);
    const b = answers({ type: 'bar', vibe: 'romantic' });
    expect(ids(rankPlaces([barDoZe, boteco], b, new Set(['boteco'])))).toEqual(['bar-do-ze', 'boteco']);
  });

  it('desempata pelo nome (determinístico, independe da ordem de entrada)', () => {
    const shuffled = [boteco, barDoZe];
    expect(ids(rankPlaces(shuffled, answers({ type: 'bar' })))).toEqual(['bar-do-ze', 'boteco']);
    expect(ids(rankPlaces([...shuffled].reverse(), answers({ type: 'bar' })))).toEqual(['bar-do-ze', 'boteco']);
  });

  it('não altera a lista recebida', () => {
    const input = [...all];
    rankPlaces(input, answers());
    expect(ids(input)).toEqual(ids(all));
  });
});

describe('recommend', () => {
  it('quiz Bar + Com amigos + Com álcool indica o Bar do Zé (jornada de demonstração)', () => {
    expect(recommend(all, answers({ type: 'bar', alcohol: 'yes' }))?.id).toBe('bar-do-ze');
  });

  it('pedir Cervejaria muda a indicação para quem tem a especialidade', () => {
    expect(recommend(all, answers({ type: 'bar', specialty: 'brewery', alcohol: 'yes' }))?.id).toBe('boteco');
  });

  it('"Tentar outra indicação" avança para o próximo candidato e esgota em null', () => {
    const a = answers({ type: 'bar', alcohol: 'yes' });
    const first = recommend(all, a);
    const second = recommend(all, a, [first!.id]);
    expect(second?.id).toBe('boteco');
    expect(recommend(all, a, [first!.id, second!.id])).toBeNull();
  });

  it('devolve null quando nenhum lugar atende os filtros obrigatórios', () => {
    expect(recommend(all, answers({ type: 'cafe', alcohol: 'yes' }))).toBeNull();
    expect(recommend([], answers())).toBeNull();
  });
});

describe('missingSpecialty (modo flexível)', () => {
  it('sem lugar da especialidade pedida, indica o melhor do tipo e avisa qual faltou', () => {
    const a = answers({ type: 'restaurant', specialty: 'mexican', vibe: 'romantic' });
    expect(missingSpecialty(restaurants, a)).toBe('mexican');
    expect(recommend(restaurants, a)?.id).toBe('cantina');
  });

  it('não avisa quando a especialidade existe ou quando a resposta é "Tanto faz"', () => {
    expect(missingSpecialty(restaurants, answers({ type: 'restaurant', specialty: 'japanese' }))).toBeNull();
    expect(missingSpecialty(restaurants, answers({ type: 'restaurant' }))).toBeNull();
  });

  it('considera só os candidatos que passam nos filtros obrigatórios', () => {
    const semAlcool = place('sushi-dry', 'Sushi Sem Álcool', { type: 'restaurant', specialties: ['japanese'], vibes: [], sellsAlcohol: false });
    expect(missingSpecialty([semAlcool, cantina], answers({ type: 'restaurant', specialty: 'japanese', alcohol: 'yes' }))).toBe('japanese');
  });
});

describe('matchCriteria', () => {
  it('marca o que o lugar atende e o que não atende', () => {
    const a = answers({ type: 'restaurant', specialty: 'mexican', vibe: 'romantic', atmosphere: 'lively', alcohol: 'yes' });
    expect(matchCriteria(cantina, a)).toEqual([
      { label: 'Restaurante', met: true },
      { label: 'Mexicana', met: false },
      { label: 'A dois', met: true },
      { label: 'Animado', met: false },
      { label: 'Com álcool', met: true },
    ]);
  });
});

describe('parseAnswers', () => {
  const valid = { type: 'restaurant', specialty: 'japanese', vibe: 'romantic', atmosphere: 'calm', alcohol: 'yes' };

  it('aceita respostas válidas vindas da rota', () => {
    expect(parseAnswers(valid)).toEqual(valid);
    expect(parseAnswers({ type: 'any', specialty: 'any', vibe: 'family', atmosphere: 'any', alcohol: 'any' })?.type).toBe('any');
  });

  it('a especialidade precisa pertencer ao tipo escolhido', () => {
    expect(parseAnswers({ ...valid, specialty: 'brewery' })).toBeNull();
    expect(parseAnswers({ ...valid, type: 'any', specialty: 'japanese' })).toBeNull();
  });

  it('rejeita parâmetros ausentes ou inválidos (URL adulterada)', () => {
    expect(parseAnswers({})).toBeNull();
    expect(parseAnswers({ ...valid, atmosphere: undefined })).toBeNull();
    expect(parseAnswers({ ...valid, type: 'pizzaria' })).toBeNull();
    expect(parseAnswers({ ...valid, vibe: 'party' })).toBeNull();
    expect(parseAnswers({ ...valid, alcohol: 'no' })).toBeNull();
  });
});

describe('describeAnswers', () => {
  it('lista só o que foi pedido', () => {
    expect(describeAnswers(answers({ type: 'bar', alcohol: 'yes' }))).toBe('Bar · Com amigos · Com álcool');
    expect(describeAnswers(answers({ type: 'restaurant', specialty: 'japanese', vibe: 'romantic', atmosphere: 'calm' }))).toBe(
      'Restaurante · Japonesa · A dois · Tranquilo pra conversar',
    );
    expect(describeAnswers(answers({ vibe: 'romantic' }))).toBe('A dois');
  });
});
