import { Check, CheckCircle, type Icon } from 'phosphor-react-native';
import { Children, Fragment, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { colors, shadows } from '@/theme/tokens';

import { Text } from './Text';

// Figma › Seletores: substituem rádios e checkboxes do wireframe por controles fáceis de tocar (mín. 44–52 px).
// Opção em bloco = escolha única com ícone; Segmento = 2–3 opções curtas; Opção de lista = múltipla escolha.
// Selecionado sempre com check.

type BlockProps = {
  label: string;
  icon: Icon;
  selected?: boolean;
  onPress?: () => void;
};

/** Opção em bloco (≈107×96). Use dentro de `flex-row gap-2`; ocupa a largura disponível (`flex-1`). */
export function OptionBlock({ label, icon: IconComponent, selected = false, onPress }: BlockProps) {
  const fg = selected ? colors['sobre-acento'] : colors.texto;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`min-h-[96px] flex-1 justify-between rounded-md border px-3 py-4 ${
        selected ? 'border-acento bg-acento' : 'border-linha-controle bg-superficie active:bg-superficie-alt'
      }`}>
      <IconComponent size={24} color={fg} />
      <Text variant="rotulo-forte" tone={selected ? 'sobre-acento' : 'texto'}>
        {label}
      </Text>
      {selected ? (
        <View className="absolute right-3 top-3">
          <CheckCircle size={20} weight="fill" color={fg} />
        </View>
      ) : null}
    </Pressable>
  );
}

type SegmentedProps<T extends string> = {
  options: readonly { value: T; label: string }[];
  value: T | undefined;
  onChange: (value: T) => void;
};

/** Segmento: trilho em superfície-alt; a opção ativa vira uma pílula branca com check. */
export function Segmented<T extends string>({ options, value, onChange }: SegmentedProps<T>) {
  return (
    <View className="flex-row gap-1 rounded-md bg-superficie-alt p-1" accessibilityRole="radiogroup">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            onPress={() => onChange(option.value)}
            className="h-11 flex-1 flex-row items-center justify-center gap-2 rounded-sm"
            style={selected ? { backgroundColor: colors.superficie, boxShadow: shadows['sombra-1'] } : undefined}>
            {selected ? <Check size={16} weight="bold" color={colors.texto} /> : null}
            <Text variant={selected ? 'rotulo-forte' : 'rotulo'} tone={selected ? 'texto' : 'secundario'}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

type ListOptionProps = {
  label: string;
  /** checkbox = múltipla escolha; radio = escolha única. */
  type?: 'checkbox' | 'radio';
  selected?: boolean;
  onPress?: () => void;
};

/** Opção de lista (52 px): rótulo à esquerda, controle à direita. Agrupe com <OptionList>. */
export function ListOption({ label, type = 'checkbox', selected = false, onPress }: ListOptionProps) {
  return (
    <Pressable
      accessibilityRole={type === 'checkbox' ? 'checkbox' : 'radio'}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      className="h-[52px] flex-row items-center justify-between gap-3 px-4 active:bg-superficie-alt">
      <Text variant="corpo" className="flex-1">
        {label}
      </Text>
      <View
        className={`h-[22px] w-[22px] items-center justify-center border-[1.5px] ${
          type === 'checkbox' ? 'rounded-[6px]' : 'rounded-pilula'
        } ${selected ? 'border-acento bg-acento' : 'border-linha-controle bg-superficie'}`}>
        {selected ? <Check size={14} weight="bold" color={colors['sobre-acento']} /> : null}
      </View>
    </Pressable>
  );
}

/** Contêiner das opções de lista: cartão com divisores entre as linhas. */
export function OptionList({ children }: { children: ReactNode }) {
  const items = Children.toArray(children);
  return (
    <View className="overflow-hidden rounded-lg border border-linha bg-superficie">
      {items.map((child, index) => (
        <Fragment key={index}>
          {index > 0 ? <View className="h-px bg-linha" /> : null}
          {child}
        </Fragment>
      ))}
    </View>
  );
}
