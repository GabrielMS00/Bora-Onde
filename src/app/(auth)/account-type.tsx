import { router } from 'expo-router';
import { CaretRight, Storefront, User, type Icon } from 'phosphor-react-native';
import { Pressable, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/tokens';

function AccountOption({ icon: IconComponent, title, description, onPress }: { icon: Icon; title: string; description: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      className="flex-row items-center gap-4 rounded-lg border border-linha bg-superficie p-5 active:bg-superficie-alt">
      <View className="h-[72px] w-[72px] items-center justify-center rounded-lg bg-superficie-alt">
        <IconComponent size={32} color={colors.texto} />
      </View>
      <View className="flex-1 gap-1">
        <Text variant="h3">{title}</Text>
        <Text variant="corpo-sm" tone="secundario">
          {description}
        </Text>
      </View>
      <CaretRight size={20} color={colors['texto-secundario']} />
    </Pressable>
  );
}

// 1.2 Seleção de tipo de conta.
export default function AccountTypeScreen() {
  return (
    <Screen header={<ScreenHeader title="Criar conta" />}>
      <View className="gap-2 pb-6 pt-3">
        <Text variant="h1">Como você deseja usar o Bora Onde?</Text>
        <Text variant="corpo" tone="secundario">
          Escolha o tipo de conta. Ele define o que você vê e faz no app.
        </Text>
      </View>
      <View className="gap-4">
        <AccountOption
          icon={User}
          title="Usuário padrão"
          description="Quero descobrir lugares para sair, comer e beber."
          onPress={() => router.push('/signup-user')}
        />
        <AccountOption
          icon={Storefront}
          title="Dono de estabelecimento"
          description="Quero divulgar meu restaurante, bar ou cafeteria."
          onPress={() => router.push('/signup-establishment')}
        />
      </View>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel="Já tenho conta. Entrar"
        onPress={() => router.dismissTo('/login')}
        className="mt-8 h-10 items-center justify-center self-center">
        <Text variant="rotulo" tone="secundario">
          Já tenho conta. <Text variant="rotulo-forte">Entrar</Text>
        </Text>
      </Pressable>
    </Screen>
  );
}
