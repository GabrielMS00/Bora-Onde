import { supabase } from '@/data/supabase';

export type UserProfile = { id: string; name: string; age: number; gender: 'F' | 'M' | 'O'; city: string };

export async function updateMyCity(uid: string, city: string) {
  const { data, error } = await supabase.from('users').update({ city }).eq('id', uid).select('id');
  if (error) throw new Error(error.message);
  if (!data?.length) throw new Error('Perfil não encontrado.');
}

export async function fetchMyUser(uid: string): Promise<UserProfile> {
  const { data, error } = await supabase.from('users').select('id,name,age,gender,city').eq('id', uid).single();
  if (error) throw new Error(error.message);
  return data as UserProfile;
}
