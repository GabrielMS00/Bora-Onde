import { supabase } from '@/data/supabase';

export type UserProfile = { id: string; name: string; age: number; gender: 'F' | 'M' | 'O'; city: string };

/** Perfil do Usuário Padrão logado (RLS só devolve a própria linha). */
export async function fetchMyUser(uid: string): Promise<UserProfile> {
  const { data, error } = await supabase.from('users').select('id,name,age,gender,city').eq('id', uid).single();
  if (error) throw new Error(error.message);
  return data as UserProfile;
}
