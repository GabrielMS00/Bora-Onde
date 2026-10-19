import { Check, Trash } from 'phosphor-react-native';
import { Modal, Pressable, View } from 'react-native';

import { colors } from '@/theme/tokens';

import { Button } from './Button';
import { Text } from './Text';

type Props = {
  visible: boolean;
  type?: 'destrutivo' | 'sucesso';
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  cancelLabel?: string;
  onCancel?: () => void;
  loading?: boolean;
};

export function ConfirmModal({
  visible,
  type = 'destrutivo',
  title,
  message,
  confirmLabel,
  onConfirm,
  cancelLabel = 'Cancelar',
  onCancel,
  loading,
}: Props) {
  const destrutivo = type === 'destrutivo';

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onCancel}>
      <Pressable
        accessibilityLabel="Fechar"
        onPress={destrutivo ? onCancel : undefined}
        className="flex-1 items-center justify-center bg-sobreposicao px-6">
        <Pressable
          accessibilityViewIsModal
          className={`w-full max-w-[345px] items-center gap-4 rounded-xl bg-superficie px-6 pt-6 ${destrutivo ? 'pb-4' : 'pb-6'}`}>
          <View className={`h-14 w-14 items-center justify-center rounded-pilula ${destrutivo ? 'bg-erro-suave' : 'bg-sucesso-suave'}`}>
            {destrutivo ? (
              <Trash size={26} color={colors.erro} />
            ) : (
              <Check size={26} weight="bold" color={colors.sucesso} />
            )}
          </View>
          <Text variant="h2" className="text-center" accessibilityRole="header">
            {title}
          </Text>
          <Text variant="corpo-sm" tone="secundario" className="text-center">
            {message}
          </Text>
          <View className="w-full gap-4">
            <Button
              label={confirmLabel}
              variant={destrutivo ? 'destrutivo' : 'primario'}
              onPress={onConfirm}
              loading={loading}
            />
            {destrutivo ? <Button label={cancelLabel} variant="secundario" onPress={onCancel} disabled={loading} /> : null}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
