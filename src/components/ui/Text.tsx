import { Text as RNText, type TextProps } from 'react-native';

import { typography, type TextVariant } from '@/theme/typography';

// Cor por `tone` (e não por className): no Tailwind a ordem das classes não decide a precedência,
// então um `text-*` extra não sobrescreve de forma confiável o padrão.
const tones = {
  texto: 'text-texto',
  secundario: 'text-texto-secundario',
  'sobre-acento': 'text-sobre-acento',
  'sobre-erro': 'text-sobre-erro',
  fundo: 'text-fundo',
  erro: 'text-erro',
  sucesso: 'text-sucesso',
  alerta: 'text-alerta',
} as const;

export type TextTone = keyof typeof tones;

type Props = TextProps & {
  variant?: TextVariant;
  tone?: TextTone;
};

export function Text({ variant = 'corpo', tone = 'texto', className, ...rest }: Props) {
  return (
    <RNText
      className={[typography[variant], tones[tone], className].filter(Boolean).join(' ')}
      {...rest}
    />
  );
}
