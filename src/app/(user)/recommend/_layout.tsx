import { Stack } from 'expo-router';

// Questionário → resultado dentro da aba Indicação (a barra de abas continua visível).
export default function RecommendLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
