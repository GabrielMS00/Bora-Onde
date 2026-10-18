import { CaretDown, Check, type Icon } from 'phosphor-react-native';
import { Pressable, View } from 'react-native';

import { colors } from '@/theme/tokens';

import { Text } from './Text';

// Figma › Chip: "uma pílula, três usos". Filtro (36 px) no feed; Indicação (48 px) nas perguntas;
// Tag (24 px) informativa dentro do card. A seleção vira acento e sempre ganha check (no lugar do ícone).

export type ChipVariant = 'filtro' | 'indicacao' | 'tag';

type Props = {
  label: string;
  variant?: ChipVariant;
  selected?: boolean;
  /** Ícone de categoria; some quando selecionado (o check ocupa o lugar). */
  icon?: Icon;
  /** Filtro que abre painel (ex.: "Ambiente ▾"). */
  dropdown?: boolean;
  onPress?: () => void;
};

export function Chip({ label, variant = 'filtro', selected = false, icon: IconComponent, dropdown, onPress }: Props) {
  if (variant === 'tag') {
    return (
      <View className="h-6 flex-row items-center gap-1 self-start rounded-pilula bg-superficie-alt px-[10px]">
        {IconComponent ? <IconComponent size={14} color={colors.texto} /> : null}
        <Text variant="tag">{label}</Text>
      </View>
    );
  }

  const big = variant === 'indicacao';
  const fg = selected ? colors['sobre-acento'] : colors.texto;
  const box = selected
    ? 'border-acento bg-acento'
    : big
      ? 'border-linha-controle bg-superficie active:bg-superficie-alt'
      : 'border-linha bg-superficie active:bg-superficie-alt';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`flex-row items-center gap-[6px] self-start rounded-pilula border ${box} ${big ? 'h-12 px-4' : 'h-9 px-[13px]'}`}>
      {selected ? (
        <Check size={16} color={fg} weight="bold" />
      ) : IconComponent ? (
        <IconComponent size={big ? 20 : 16} color={fg} />
      ) : null}
      {big ? (
        // 16 px nas perguntas da Indicação (rotulo é 14 px, usado no filtro).
        <Text variant="rotulo" tone={selected ? 'sobre-acento' : 'texto'} style={{ fontSize: 16, lineHeight: 20 }}>
          {label}
        </Text>
      ) : (
        <Text variant="rotulo" tone={selected ? 'sobre-acento' : 'texto'}>
          {label}
        </Text>
      )}
      {dropdown ? <CaretDown size={14} color={fg} /> : null}
    </Pressable>
  );
}
