import { Info, Sparkle } from 'phosphor-react-native';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { colors } from '@/theme/tokens';

import { Text } from './Text';

/** Selo (Figma): pílula Meia-Noite com sparkle, ex.: "Match ideal pra hoje". Exclusivo da Indicação. */
export function Badge({ label }: { label: string }) {
  return (
    <View className="h-7 flex-row items-center gap-[6px] self-start rounded-pilula bg-acento px-3">
      <Sparkle size={16} weight="fill" color={colors['sobre-acento']} />
      <Text variant="tag" tone="sobre-acento">
        {label}
      </Text>
    </View>
  );
}

/** Caixa informativa (Figma): superfície-alt, ícone de info e texto de apoio. */
export function InfoBox({ children }: { children: ReactNode }) {
  return (
    <View className="flex-row items-start gap-[10px] rounded-md bg-superficie-alt p-[14px]">
      <Info size={18} color={colors.texto} style={{ marginTop: 1 }} />
      <Text variant="corpo-sm" className="flex-1">
        {children}
      </Text>
    </View>
  );
}
