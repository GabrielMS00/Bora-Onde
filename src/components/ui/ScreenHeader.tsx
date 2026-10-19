import { router } from 'expo-router';
import { CaretLeft } from 'phosphor-react-native';
import { Pressable, View } from 'react-native';

import { colors } from '@/theme/tokens';

import { Text } from './Text';

type Props = {
  title: string;
  onBack?: () => void;
};

export function ScreenHeader({ title, onBack }: Props) {
  return (
    <View className="h-[52px] flex-row items-center px-[6px]">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))}
        className="h-11 w-11 items-center justify-center rounded-pilula active:bg-superficie-alt">
        <CaretLeft size={24} color={colors.texto} />
      </Pressable>
      <Text variant="h3" className="flex-1 text-center" numberOfLines={1} accessibilityRole="header">
        {title}
      </Text>
      <View className="h-11 w-11" />
    </View>
  );
}
