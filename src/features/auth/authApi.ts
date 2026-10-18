import type { AuthError } from '@supabase/supabase-js';

import { supabase } from '@/data/supabase';

import type { SignupUserForm } from './schemas';

/** Erro com mensagem já pronta para o usuário (em português). */
export class AuthFailure extends Error {}

function friendly(error: AuthError, fallback: string): AuthFailure {
  const msg = error.message.toLowerCase();
  if (msg.includes('invalid login credentials')) return new AuthFailure('E-mail ou senha incorretos.');
  if (msg.includes('already registered') || msg.includes('already been registered')) return new AuthFailure('Este e-mail já está cadastrado.');
  // "email rate limit" = o projeto está tentando enviar e-mail de confirmação (SMTP embutido tem limite baixo).
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

/**
 * Cadastro de Usuário Padrão. O perfil (public.users) é criado por trigger no banco a partir destes metadados,
 * na mesma transação do auth.users — por isso não há inserção separada aqui.
 */
export async function registerUser(form: SignupUserForm) {
  const { data, error } = await supabase.auth.signUp({
    email: form.email.trim(),
    password: form.password,
    options: {
      data: { role: 'user', name: form.name.trim(), age: Number(form.age), gender: form.gender, city: form.city },
    },
  });
  if (error) throw friendly(error, 'Não foi possível criar a conta. Tente novamente.');
  // Com "Confirm email" ligado o signUp não devolve sessão: o app ficaria parado. É config do projeto, não do usuário.
  if (!data.session) {
    throw new AuthFailure('Cadastro criado, mas o projeto exige confirmação de e-mail. Desative "Confirm email" no Supabase (veja o README).');
  }
}
