import { Stack } from 'expo-router';

import { colors } from '@/theme/tokens';

// Questionário → resultado dentro da aba Indicação (a barra de abas continua visível). Fundo "Pedra".
export default function RecommendLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors['superficie-alt'] } }} />;
}
