# Bora Onde

App mobile que centraliza opções de restaurantes, cafeterias e bares em um feed por cidade e, por meio de um
**Questionário de Indicação**, recomenda o lugar certo para o momento. Projeto de portfólio.

> Em construção — fase atual: **3. Supabase + Auth**. O README completo (GIFs e créditos das fotos) chega na fase 6.

## Stack

- Expo (SDK 57, compatível com o Expo Go da App Store) + Expo Router + TypeScript
- NativeWind 4 (Tailwind 3) com os tokens do Figma
- Supabase: Postgres + Auth + Storage, com Row Level Security

## Configurar o Supabase (uma vez)

1. Crie um projeto gratuito em [supabase.com](https://supabase.com) (região mais próxima, ex.: São Paulo).
2. **Authentication → Providers → Email**: desligue **"Confirm email"** (senão o cadastro exige clicar em um link).
3. **SQL Editor**: cole todo o conteúdo de [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) e execute
   (cria tabelas, RLS, o trigger de cadastro, o bucket `place-photos` e a função `delete_my_account`). É idempotente.
4. Pegue a URL e a chave pública em **Connect** (ou *Settings → API Keys*) e crie o `.env` a partir do `.env.example`:

   ```
   EXPO_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   EXPO_PUBLIC_SUPABASE_KEY=sb_publishable_...   # ou a anon key legada
   ```

5. Crie o `.env.seed` a partir do `.env.seed.example` com a **secret key** (`sb_secret_…` ou `service_role`).
   Ela ignora o RLS: fica só na sua máquina, nunca no app nem no Git (o `.gitignore` já cobre).
6. Popule a demonstração (contas demo, 4 lugares de Campinas, fotos) e confira o RLS:

   ```bash
   npm run seed
   npm run check:rls
   ```

Contas demo (senha `demo12345`): `ana@boraonde.demo` (usuário) e `bardoze@boraonde.demo` (estabelecimento).
A tela de login tem atalhos "Entrar como … demo".

> O plano gratuito do Supabase pausa projetos sem uso por cerca de uma semana. Se acontecer, restaure o projeto no
> painel (os dados são mantidos).

## Rodar

```bash
npm install
npx expo start
```

Abra no Expo Go (celular na mesma rede Wi-Fi) ou use `w` para a versão web. As rotas ocultas `/dev/kit` e
`/dev/components` mostram os tokens e todos os componentes do UI Kit.

## Autenticação

- Cadastro e login usam o Supabase Auth (e-mail e senha). O perfil é criado por um trigger no banco a partir dos
  metadados do cadastro.
- "Esqueci minha senha" é **apenas interface** (decisão de escopo do projeto): valida o e-mail e mostra o modal
  "Link enviado!", sem enviar nada.

## Estrutura

```
src/app/            rotas (Expo Router) — só telas e layouts
src/components/ui/  componentes do UI Kit
src/features/       auth (sessão, API, schemas) e, nas próximas fases, feed/indicação/estabelecimento
src/data/           cliente Supabase e tipos
src/theme/          tokens do Figma (tokens.json é a fonte única: Tailwind + TypeScript)
supabase/           migration SQL e fotos de seed
scripts/            seed.mjs e check-rls.mjs
assets/brand/       logotipos exportados do Figma
```
