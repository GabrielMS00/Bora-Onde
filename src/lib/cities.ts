export const CITIES = ['Brasília, DF', 'São Paulo, SP', 'Belo Horizonte, MG'] as const;

export type City = (typeof CITIES)[number];
