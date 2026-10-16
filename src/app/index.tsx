import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo } from '@/components/ui/Logo';
import { Text } from '@/components/ui/Text';

// Tela provisória da Fase 1: a navegação real (auth/abas) entra nas fases 2 e 3.
export default function Index() {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 items-center justify-center gap-6 bg-fundo px-5"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <Logo variant="empilhado" height={104} />
      <Text variant="corpo" tone="secundario" className="text-center">
        Descubra onde comer e beber sem passar horas decidindo.
      </Text>
      <Link href="/dev/kit" asChild>
        <Pressable className="h-[52px] items-center justify-center rounded-md bg-acento px-6 active:bg-acento-pressionado">
          <Text variant="botao" tone="inverso">
            Abrir UI Kit
          </Text>
        </Pressable>
      </Link>
    </View>
  );
}
