import type { AuthError } from '@supabase/supabase-js';

import { updateMyPlace } from '@/data/api/placesApi';
import { uploadPhoto } from '@/data/api/storageApi';
import { supabase } from '@/data/supabase';
import type { SignupEstablishmentForm } from '@/features/establishment/schemas';
import type { PickedImage } from '@/lib/image';

import type { SignupUserForm } from './schemas';

export class AuthFailure extends Error {}

function friendly(error: AuthError, fallback: string): AuthFailure {
  const msg = error.message.toLowerCase();
  if (msg.includes('invalid login credentials')) return new AuthFailure('E-mail ou senha incorretos.');
  if (msg.includes('already registered') || msg.includes('already been registered')) return new AuthFailure('Este e-mail já está cadastrado.');
  if (error.code === 'over_email_send_rate_limit' || msg.includes('email rate limit')) {
    return new AuthFailure('Limite de e-mails do projeto atingido. Desative "Confirm email" no Supabase (veja o README) ou tente mais tarde.');
  }
  if (msg.includes('rate limit') || error.status === 429) return new AuthFailure('Muitas tentativas. Aguarde um instante e tente de novo.');
  if (msg.includes('fetch') || msg.includes('network')) return new AuthFailure('Sem conexão. Verifique a internet e tente de novo.');
  return new AuthFailure(fallback);
}

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw friendly(error, 'Não foi possível entrar. Tente novamente.');
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function registerEstablishment(form: SignupEstablishmentForm, photos: PickedImage[]) {
  const { data, error } = await supabase.auth.signUp({
    email: form.email.trim(),
    password: form.password,
    options: {
      data: {
        role: 'establishment',
        name: form.name.trim(),
        cep: form.cep,
        city: form.city,
        neighborhood: form.neighborhood.trim(),
        street: form.street.trim(),
        number: form.number.trim(),
      },
    },
  });
  if (error) throw friendly(error, 'Não foi possível cadastrar o estabelecimento. Tente novamente.');
  if (!data.session || !data.user) {
    throw new AuthFailure('Cadastro criado, mas o projeto exige confirmação de e-mail. Desative "Confirm email" no Supabase (veja o README).');
  }

  try {
    const uid = data.user.id;
    const { data: place, error: placeError } = await supabase.from('establishments').select('id').eq('owner_id', uid).single();
    if (placeError) throw placeError;

    const paths: string[] = [];
    for (const photo of photos) paths.push(await uploadPhoto(uid, photo));
    await updateMyPlace(place.id, {
      name: form.name.trim(),
      cep: form.cep,
      city: form.city,
      neighborhood: form.neighborhood.trim(),
      street: form.street.trim(),
      number: form.number.trim(),
      photos: paths,
    });
    return { photosFailed: false };
  } catch {
    return { photosFailed: true };
  }
}

export async function registerUser(form: SignupUserForm) {
  const { data, error } = await supabase.auth.signUp({
    email: form.email.trim(),
    password: form.password,
    options: {
      data: { role: 'user', name: form.name.trim(), age: Number(form.age), gender: form.gender, city: form.city },
    },
  });
  if (error) throw friendly(error, 'Não foi possível criar a conta. Tente novamente.');
  if (!data.session) {
    throw new AuthFailure('Cadastro criado, mas o projeto exige confirmação de e-mail. Desative "Confirm email" no Supabase (veja o README).');
  }
}
