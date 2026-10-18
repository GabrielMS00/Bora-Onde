const tokens = require('./src/theme/tokens.json');

// Tudo em px (não rem): o Figma é em px = dp no React Native e a escala base é 4.
const spacing = {
  px: '1px',
  ...Object.fromEntries(
    [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96].map(
      (n) => [String(n), `${n * 4}px`],
    ),
  ),
};

// letterSpacing no Figma vem em %: px = tamanho × % / 100.
const fontSize = Object.fromEntries(
  Object.entries(tokens.type).map(([name, t]) => [
    name,
    [
      `${t.size}px`,
      {
        lineHeight: `${t.lineHeight}px`,
        letterSpacing: `${Number(((t.size * t.trackingPct) / 100).toFixed(2))}px`,
      },
    ],
  ]),
);

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  // Só tema Dia: 'class' impede que o NativeWind siga o modo escuro do sistema (e evita o erro de
  // "set color scheme" no web, onde o css-interop observa o <html>).
  darkMode: 'class',
  theme: {
    // Substitui (não estende) a paleta/escalas padrão: só existe o que o design system define.
    colors: { transparent: 'transparent', ...tokens.colors },
    spacing,
    borderRadius: {
      none: '0px',
      ...Object.fromEntries(Object.entries(tokens.radius).map(([k, v]) => [k, `${v}px`])),
    },
    fontSize,
    fontFamily: Object.fromEntries(
      Object.entries(tokens.fontFamilies).map(([k, v]) => [k, [v]]),
    ),
    extend: {},
  },
  plugins: [],
};
