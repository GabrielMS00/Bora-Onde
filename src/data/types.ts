// Tipos de domínio do app. Na Fase 3 serão alinhados ao schema do Supabase (supabase/migrations/0001_init.sql).

export type PlaceType = 'restaurant' | 'cafe' | 'bar';
export type Vibe = 'family' | 'friends' | 'romantic';

/** Dados Extras (tela 3.2): alimentam o motor de indicação. Ausentes até o dono preencher. */
export type PlaceMetadata = {
  type?: PlaceType;
  vibes: Vibe[];
  sellsAlcohol?: boolean;
};

export type Place = {
  id: string;
  name: string;
  /** Caminhos/URLs das fotos; a primeira é a capa. */
  photos: string[];
  /** Somente dígitos (8). */
  cep: string;
  /** Formato "Campinas, SP". */
  city: string;
  neighborhood: string;
  street: string;
  number: string;
  metadata?: PlaceMetadata;
};
