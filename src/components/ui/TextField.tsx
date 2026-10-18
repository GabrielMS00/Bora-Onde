import { Eye, EyeSlash, WarningCircle, type Icon } from 'phosphor-react-native';
import { useState, type Ref } from 'react';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';

import { colors } from '@/theme/tokens';

import { Text } from './Text';

// Figma › Campo de texto: rótulo acima, caixa de 52 px em superfície com borda linha-controle e raio-md.
// Focado: borda de 2 px em texto, com cursor. Erro: borda em erro e mensagem com ícone (nunca só a cor).
// Tipos do kit: texto, senha (mostrar), busca (lupa) e local (ver SelectField).

type Props = Omit<TextInputProps, 'style' | 'placeholderTextColor'> & {
  label: string;
  error?: string;
  /** Texto de apoio abaixo da caixa (some quando há erro), ex.: "Mínimo de 8 caracteres". */
  hint?: string;
  /** Ícone funcional à esquerda (ex.: lupa na busca). */
  leftIcon?: Icon;
  /** Tipo senha: oculta o texto e mostra o botão "mostrar". */
  password?: boolean;
  ref?: Ref<TextInput>;
};

export function TextField({
  label,
  error,
  hint,
  leftIcon: LeftIcon,
  password = false,
  onFocus,
  onBlur,
  ref,
  ...inputProps
}: Props) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  // Borda 1 → 2 px no foco, compensando o padding para o texto não "pular".
  const borderWidth = focused || error ? 2 : 1;
  const borderColor = error ? colors.erro : focused ? colors.texto : colors['linha-controle'];

  return (
    <View className="gap-2">
      <Text variant="rotulo">{label}</Text>
      <View
        className="h-[52px] flex-row items-center gap-2 rounded-md bg-superficie"
        style={{ borderWidth, borderColor, paddingHorizontal: 17 - borderWidth }}>
        {LeftIcon ? <LeftIcon size={20} color={colors['texto-secundario']} /> : null}
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          placeholderTextColor={colors['texto-secundario']}
          secureTextEntry={password && !revealed}
          autoCapitalize={password ? 'none' : inputProps.autoCapitalize}
          autoCorrect={password ? false : inputProps.autoCorrect}
          cursorColor={colors.texto}
          selectionColor={colors.texto}
          // Sem lineHeight no TextInput (desalinha no iOS); família por peso, como no resto do app.
          // min-w-0: no web o input tem largura intrínseca (~170 px) e, sem isso, vaza de campos estreitos (ex.: Número).
          className="min-w-0 flex-1 font-dm-regular text-[16px] text-texto"
          style={{ paddingVertical: 0, outlineStyle: 'none' } as never}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...inputProps}
        />
        {password ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Ocultar senha' : 'Mostrar senha'}
            hitSlop={8}
            onPress={() => setRevealed((v) => !v)}>
            {revealed ? (
              <EyeSlash size={20} color={colors['texto-secundario']} />
            ) : (
              <Eye size={20} color={colors['texto-secundario']} />
            )}
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <View className="-mt-1 flex-row items-center gap-1" accessibilityLiveRegion="polite">
          <WarningCircle size={16} weight="fill" color={colors.erro} />
          <Text variant="corpo-sm" tone="erro" className="flex-1">
            {error}
          </Text>
        </View>
      ) : hint ? (
        <Text variant="corpo-sm" tone="secundario" className="-mt-1">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
