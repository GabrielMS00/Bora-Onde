import '../global.css';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { ToastProvider } from '@/components/ui/Toast';
import { SessionProvider, useSession } from '@/features/auth/session';
import { useAppFonts } from '@/theme/fonts';
import { colors } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync();

// Cada papel só enxerga o seu grupo de rotas. Ao entrar/sair, o router remove o histórico do grupo que perdeu
// o acesso e cai no `index`, que redireciona conforme a sessão.
function Routes() {
  const { session } = useSession();

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.fundo } }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={session?.role === 'user'}>
        <Stack.Screen name="(user)" />
      </Stack.Protected>
      <Stack.Protected guard={session?.role === 'establishment'}>
        <Stack.Screen name="(establishment)" />
      </Stack.Protected>
      {/* Rotas de desenvolvimento (UI Kit): fora dos guards. */}
      <Stack.Screen name="dev/kit" />
      <Stack.Screen name="dev/components" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontsError] = useAppFonts();

  useEffect(() => {
    if (fontsLoaded || fontsError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontsError]);

  if (!fontsLoaded && !fontsError) return null;

  return (
    <SessionProvider>
      <ToastProvider>
        <StatusBar style="dark" />
        <Routes />
      </ToastProvider>
    </SessionProvider>
  );
}
