// Contas de demonstração (criadas por scripts/seed.mjs). Públicas de propósito: servem ao atalho "entrar como demo"
// do login — substituem o atalho tracejado do protótipo — para quem avalia o app sem se cadastrar.
export const DEMO_ACCOUNTS = {
  user: { email: 'ana@boraonde.demo', password: 'demo12345', label: 'usuário' },
  establishment: { email: 'bardoze@boraonde.demo', password: 'demo12345', label: 'estabelecimento' },
} as const;
