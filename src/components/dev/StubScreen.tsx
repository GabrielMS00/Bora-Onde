import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Text } from '@/components/ui/Text';

type Props = {
  title: string;
  /** Tela do Figma que este stub representa, ex.: "1.1 Login". */
  figma: string;
  /** Fase em que a tela real é implementada. */
  phase: number;
  /** Mostra o cabeçalho com voltar (telas de pilha). */
  back?: boolean;
  /** Dentro da barra de abas (já reserva a área segura inferior). */
  tab?: boolean;
  children?: ReactNode;
};

// Tela provisória da Fase 2: valida rotas, guards e barra de abas. Cada stub é substituído na sua fase.
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
