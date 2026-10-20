export type PlaceType = 'restaurant' | 'cafe' | 'bar';
export type Vibe = 'solo' | 'romantic' | 'friends' | 'family' | 'work' | 'group';
export type Specialty =
  | 'brazilian'
  | 'italian'
  | 'japanese'
  | 'mexican'
  | 'arab'
  | 'burger'
  | 'pub'
  | 'brewery'
  | 'cocktails'
  | 'wine'
  | 'specialty_coffee'
  | 'bakery'
  | 'sweets';
export type Atmosphere = 'calm' | 'lively' | 'outdoor';

export type PlaceMetadata = {
  type?: PlaceType;
  specialties: Specialty[];
  vibes: Vibe[];
  atmospheres: Atmosphere[];
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
