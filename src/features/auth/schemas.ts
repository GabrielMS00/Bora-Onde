import { z } from 'zod';

import { CITIES } from '@/lib/cities';

const email = z.string().trim().min(1, 'Informe seu e-mail.').pipe(z.email('Informe um e-mail válido.'));
const password = z.string().min(8, 'A senha precisa ter ao menos 8 caracteres.');
const city = z.string().min(1, 'Escolha sua cidade.').refine((v) => (CITIES as readonly string[]).includes(v), 'Escolha uma cidade da lista.');

export const loginSchema = z.object({
  email,
  // No login só exigimos que exista; a regra de tamanho vale no cadastro.
  password: z.string().min(1, 'Informe sua senha.'),
});

export const forgotPasswordSchema = z.object({ email });

export const signupUserSchema = z.object({
  name: z.string().trim().min(3, 'Informe seu nome completo.').max(120, 'O nome é muito longo.'),
  // Campo de texto: guardamos como string e validamos a faixa (o app lida com bebida alcoólica → 18+).
  age: z
    .string()
    .min(1, 'Informe sua idade.')
    .refine((v) => /^\d{1,3}$/.test(v) && Number(v) >= 18 && Number(v) <= 120, 'A idade deve estar entre 18 e 120 anos.'),
  gender: z.enum(['F', 'M', 'O'], { error: 'Escolha uma opção.' }),
  city,
  email,
  password,
});

export type LoginForm = z.infer<typeof loginSchema>;
export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
export type SignupUserForm = z.infer<typeof signupUserSchema>;
