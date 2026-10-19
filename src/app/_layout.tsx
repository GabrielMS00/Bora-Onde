import '../global.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

import { ToastProvider } from '@/components/ui/Toast';
import { SessionProvider, useSession } from '@/features/auth/session';
import { useAppFonts } from '@/theme/fonts';
import { colors } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync();

function Routes() {
  const { session, loading } = useSession();

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync();
  }, [loading]);

  if (loading) return null;

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
      <Stack.Screen name="dev/kit" />
      <Stack.Screen name="dev/components" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontsError] = useAppFonts();
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } }));

  if (!fontsLoaded && !fontsError) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <ToastProvider>
          <StatusBar style="dark" />
          <Routes />
        </ToastProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
