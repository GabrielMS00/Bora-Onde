import { describe, expect, it } from '@jest/globals';

import type { Place, PlaceMetadata } from '@/data/types';

import { NO_FILTERS, filterPlaces, hasFilters, resultLabel } from './filters';

const place = (id: string, metadata?: PlaceMetadata): Place => ({
  id,
  name: id,
  photos: [],
  cep: '13025151',
  city: 'Campinas, SP',
  neighborhood: 'Cambuí',
  street: 'Rua Teste',
  number: '1',
  metadata,
});

const bar = place('bar', { type: 'bar', vibes: ['friends'], sellsAlcohol: true });
const cafe = place('cafe', { type: 'cafe', vibes: ['family'], sellsAlcohol: false });
const novo = place('novo'); // sem Dados Extras
const all = [bar, cafe, novo];
const ids = (list: Place[]) => list.map((p) => p.id);

describe('filterPlaces', () => {
  it('sem filtros devolve tudo, inclusive lugares sem Dados Extras', () => {
    expect(ids(filterPlaces(all, NO_FILTERS))).toEqual(['bar', 'cafe', 'novo']);
    expect(hasFilters(NO_FILTERS)).toBe(false);
  });

  it('filtra por tipo, ambiente e álcool (AND)', () => {
    expect(ids(filterPlaces(all, { ...NO_FILTERS, type: 'bar' }))).toEqual(['bar']);
    expect(ids(filterPlaces(all, { ...NO_FILTERS, vibe: 'family' }))).toEqual(['cafe']);
    expect(ids(filterPlaces(all, { ...NO_FILTERS, alcohol: true }))).toEqual(['bar']);
    expect(filterPlaces(all, { type: 'cafe', vibe: null, alcohol: true })).toEqual([]);
  });

  it('com qualquer filtro ativo, lugar sem Dados Extras fica de fora', () => {
    expect(ids(filterPlaces(all, { ...NO_FILTERS, alcohol: true }))).not.toContain('novo');
  });
});

describe('resultLabel', () => {
  it('descreve o resultado com singular/plural e o tipo', () => {
    expect(resultLabel({ ...NO_FILTERS, type: 'bar' }, 2)).toBe('2 lugares do tipo Bar');
    expect(resultLabel({ ...NO_FILTERS, type: 'cafe' }, 1)).toBe('1 lugar do tipo Cafeteria');
    expect(resultLabel({ ...NO_FILTERS, alcohol: true }, 3)).toBe('3 lugares');
  });
});
