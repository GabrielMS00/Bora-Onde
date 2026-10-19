import { Stack } from 'expo-router';

import { colors } from '@/theme/tokens';

export default function RecommendLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors['superficie-alt'] } }} />;
}
