# Bora Onde

App mobile que centraliza opções de restaurantes, cafeterias e bares em um feed por cidade e, por meio de um
**Questionário de Indicação**, recomenda o lugar certo para o momento. Projeto de portfólio.

> Em construção — fase atual: **1. Setup e Design Tokens**. O README completo (setup do Supabase, contas demo,
> GIFs e créditos das fotos) chega na fase 6.

## Stack

- Expo (SDK 58) + Expo Router + TypeScript
- NativeWind 4 (Tailwind 3) com os tokens do Figma
- Supabase (Postgres + Auth + Storage) — a partir da fase 3

## Rodar

```bash
npm install
npx expo start
```

Abra no Expo Go (celular na mesma rede Wi-Fi) ou use `w` para a versão web. A rota oculta `/dev/kit` mostra os
tokens de design (cores, tipografia, raios, sombras, ícones e logotipo).

## Estrutura

```
src/app/          rotas (Expo Router) — só telas e layouts
src/components/   componentes de UI
src/theme/        tokens do Figma (tokens.json é a fonte única: Tailwind + TypeScript)
assets/brand/     logotipos exportados do Figma
```
