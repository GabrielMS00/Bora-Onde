import { CaretDown, MapPin, WarningCircle, type Icon } from 'phosphor-react-native';
import { Pressable, View } from 'react-native';

import { colors } from '@/theme/tokens';

import { Text } from './Text';

// Campo do tipo "Local" do kit (Cidade): mesma caixa do Campo de texto, mas abre uma lista (BottomSheet).

type Props = {
  label: string;
  value?: string;
  placeholder?: string;
  error?: string;
  icon?: Icon;
  onPress: () => void;
};

export function SelectField({ label, value, placeholder = 'Selecione', error, icon: LeadingIcon = MapPin, onPress }: Props) {
  const borderColor = error ? colors.erro : colors['linha-controle'];
  return (
    <View className="gap-2">
      <Text variant="rotulo">{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value ?? placeholder}`}
        onPress={onPress}
        className="h-[52px] flex-row items-center gap-2 rounded-md bg-superficie active:bg-superficie-alt"
        style={{ borderWidth: error ? 2 : 1, borderColor, paddingHorizontal: error ? 15 : 16 }}>
        <LeadingIcon size={20} color={colors.texto} />
        <Text variant="corpo" tone={value ? 'texto' : 'secundario'} className="flex-1" numberOfLines={1}>
          {value ?? placeholder}
        </Text>
        <CaretDown size={20} color={colors['texto-secundario']} />
      </Pressable>
      {error ? (
        <View className="-mt-1 flex-row items-center gap-1">
          <WarningCircle size={16} weight="fill" color={colors.erro} />
          <Text variant="corpo-sm" tone="erro" className="flex-1">
            {error}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
