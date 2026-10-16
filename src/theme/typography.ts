import tokens from './tokens.json';

export type TextVariant = keyof typeof tokens.type;

// Strings literais (não montadas dinamicamente): o Tailwind só gera as classes que encontra escritas no código.
// Tamanho, altura de linha e tracking vêm de `text-*` (tailwind.config.js); o peso vem da família `font-*`,
// porque fontFamily + fontWeight não combinam em fontes customizadas no Android.
export const typography: Record<TextVariant, string> = {
  display: 'text-display font-jakarta-extrabold',
  h1: 'text-h1 font-jakarta-bold',
  h2: 'text-h2 font-jakarta-bold',
  h3: 'text-h3 font-jakarta-bold',
  corpo: 'text-corpo font-dm-regular',
  'corpo-sm': 'text-corpo-sm font-dm-regular',
  botao: 'text-botao font-dm-semibold',
  rotulo: 'text-rotulo font-dm-medium',
  'rotulo-forte': 'text-rotulo-forte font-dm-semibold',
  tag: 'text-tag font-dm-medium',
  legenda: 'text-legenda font-dm-regular',
  aba: 'text-aba font-dm-semibold',
};
