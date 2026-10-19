import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Text } from '@/components/ui/Text';

type Props = {
  title: string;
  figma: string;
  phase: number;
  back?: boolean;
  tab?: boolean;
  children?: ReactNode;
};

export function StubScreen({ title, figma, phase, back, tab, children }: Props) {
  return (
    <Screen header={back ? <ScreenHeader title={title} /> : undefined} safeBottom={!tab}>
      <View className="gap-2 pb-6 pt-4">
        {!back ? <Text variant="h1">{title}</Text> : null}
        <Text variant="corpo-sm" tone="secundario">
          Stub · Figma {figma} · implementação na Fase {phase}
        </Text>
      </View>
      <View className="gap-3">{children}</View>
    </Screen>
  );
}
