import tokens from './tokens.json';

// tokens.json é a fonte única (também lido pelo tailwind.config.js). Os nomes seguem as variáveis do Figma.
export const colors = tokens.colors;
export type ColorToken = keyof typeof colors;

export const radius = tokens.radius;
export const space = tokens.space;
export const layout = tokens.layout;

// RN não resolve sombra por classe de forma confiável; `boxShadow` (CSS-like) cobre as sombras em camadas do Figma.
export const shadows = tokens.shadows;
export type ShadowToken = keyof typeof shadows;
