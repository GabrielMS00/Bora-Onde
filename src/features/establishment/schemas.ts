import { z } from 'zod';

import { cityField, emailField, passwordField } from '@/features/auth/schemas';

// Campos do endereço/identificação do lugar: usados no cadastro (1.4) e no Perfil do local (3.3).
export const placeFieldsSchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome do estabelecimento.').max(120, 'O nome é muito longo.'),
  cep: z.string().regex(/^\d{8}$/, 'Informe um CEP válido (8 dígitos).'),
  city: cityField,
  neighborhood: z.string().trim().min(2, 'Informe o bairro.'),
  street: z.string().trim().min(2, 'Informe a rua.'),
  number: z.string().trim().min(1, 'Informe o número.').max(10, 'Número muito longo.'),
});

export const signupEstablishmentSchema = placeFieldsSchema.extend({
  email: emailField,
  password: passwordField,
});

export type PlaceFieldsForm = z.infer<typeof placeFieldsSchema>;
export type SignupEstablishmentForm = z.infer<typeof signupEstablishmentSchema>;
