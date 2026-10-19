export type PlaceType = 'restaurant' | 'cafe' | 'bar';
export type Vibe = 'family' | 'friends' | 'romantic';

export type PlaceMetadata = {
  type?: PlaceType;
  vibes: Vibe[];
  sellsAlcohol?: boolean;
};

export type Place = {
  id: string;
  name: string;
  photos: string[];
  cep: string;
  city: string;
  neighborhood: string;
  street: string;
  number: string;
  metadata?: PlaceMetadata;
};
