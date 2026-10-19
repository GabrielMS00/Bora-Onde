import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shadows } from '@/theme/tokens';

import { Text } from './Text';

type Props = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function BottomSheet({ visible, title, onClose, children }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-sobreposicao">
        <Pressable accessibilityLabel="Fechar" className="flex-1" onPress={onClose} />
        <View
          accessibilityViewIsModal
          className="max-h-[80%] rounded-t-xl bg-superficie px-5 pt-3"
          style={{ paddingBottom: Math.max(insets.bottom, 16) + 8, boxShadow: shadows['sombra-2'] }}>
          <View className="mb-4 h-1 w-10 self-center rounded-pilula bg-linha" />
          <Text variant="h2" className="mb-4" accessibilityRole="header">
            {title}
          </Text>
          <ScrollView showsVerticalScrollIndicator={false}>{children}</ScrollView>
        </View>
      </View>
    </Modal>
  );
}
