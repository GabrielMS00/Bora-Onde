import { Image } from 'expo-image';

const logos = {
  horizontal: { source: require('../../../assets/brand/logo-horizontal.svg'), ratio: 182.75 / 28 },
  'horizontal-negativo': {
    source: require('../../../assets/brand/logo-horizontal-negative.svg'),
    ratio: 182.75 / 28,
  },
  empilhado: { source: require('../../../assets/brand/logo-stacked.svg'), ratio: 207 / 104 },
  simbolo: { source: require('../../../assets/brand/logo-symbol.svg'), ratio: 33.95 / 40 },
} as const;

export type LogoVariant = keyof typeof logos;

type Props = {
  variant?: LogoVariant;
  height?: number;
};

export function Logo({ variant = 'horizontal', height = 28 }: Props) {
  const { source, ratio } = logos[variant];
  return (
    <Image
      source={source}
      style={{ height, width: height * ratio }}
      contentFit="contain"
      accessibilityLabel="Bora Onde"
    />
  );
}
