import tokens from './tokens.json';

export const colors = tokens.colors;
export type ColorToken = keyof typeof colors;

export const radius = tokens.radius;
export const space = tokens.space;
export const layout = tokens.layout;

export const shadows = tokens.shadows;
export type ShadowToken = keyof typeof shadows;
