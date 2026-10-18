import { supabase } from '@/data/supabase';
import type { Place, PlaceMetadata, PlaceType, Vibe } from '@/data/types';

import { removeAllMyPhotos } from './storageApi';

type MetadataRow = { type: PlaceType | null; vibes: Vibe[] | null; sells_alcohol: boolean | null };
type PlaceRow = {
  id: string;
  name: string;
  photos: string[];
  cep: string;
  city: string;
  neighborhood: string;
  street: string;
  number: string;
  // 1:1 (PK = FK): o PostgREST devolve objeto ou null; aceitamos array por garantia.
  establishment_metadata: MetadataRow | MetadataRow[] | null;
};

const COLUMNS =
  'id,name,photos,cep,city,neighborhood,street,number,establishment_metadata(type,vibes,sells_alcohol)';

function toPlace(row: PlaceRow): Place {
  const meta = Array.isArray(row.establishment_metadata) ? row.establishment_metadata[0] : row.establishment_metadata;
  const metadata: PlaceMetadata | undefined = meta
    ? { type: meta.type ?? undefined, vibes: meta.vibes ?? [], sellsAlcohol: meta.sells_alcohol ?? undefined }
    : undefined;
  const { establishment_metadata: _ignored, ...rest } = row;
  return { ...rest, metadata };
}

/** Lugares da cidade, em ordem alfabética (mesma ordem do Figma). `photos` traz os paths do Storage. */
export async function fetchPlacesByCity(city: string): Promise<Place[]> {
  const { data, error } = await supabase.from('establishments').select(COLUMNS).eq('city', city).order('name');
  if (error) throw new Error(error.message);
  return (data as unknown as PlaceRow[]).map(toPlace);
}

/** O lugar do estabelecimento logado. */
export async function fetchMyPlace(ownerId: string): Promise<Place> {
  const { data, error } = await supabase.from('establishments').select(COLUMNS).eq('owner_id', ownerId).single();
  if (error) throw new Error(error.message);
  return toPlace(data as unknown as PlaceRow);
}

export type PlaceFields = Pick<Place, 'name' | 'cep' | 'city' | 'neighborhood' | 'street' | 'number' | 'photos'>;

export async function updateMyPlace(id: string, fields: PlaceFields) {
  const { data, error } = await supabase.from('establishments').update(fields).eq('id', id).select('id');
  if (error) throw new Error(error.message);
  if (!data?.length) throw new Error('Não foi possível salvar: lugar não encontrado.');
}

export async function saveMetadata(placeId: string, meta: { type: PlaceType; vibes: Vibe[]; sellsAlcohol: boolean }) {
  const { error } = await supabase.from('establishment_metadata').upsert({
    establishment_id: placeId,
    type: meta.type,
    vibes: meta.vibes,
    sells_alcohol: meta.sellsAlcohol,
  });
  if (error) throw new Error(error.message);
}

/** Exclusão definitiva: apaga as fotos do dono e chama a RPC que remove auth.users (cascade limpa o resto). */
export async function deleteMyAccount(uid: string) {
  await removeAllMyPhotos(uid);
  const { error } = await supabase.rpc('delete_my_account');
  if (error) throw new Error(error.message);
  // A conta já não existe: encerra só a sessão local (sem chamar o servidor).
  await supabase.auth.signOut({ scope: 'local' });
}
