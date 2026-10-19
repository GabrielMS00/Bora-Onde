import type { Icon } from 'phosphor-react-native';
import { ActivityIndicator, Pressable, type PressableProps } from 'react-native';

import { colors } from '@/theme/tokens';

import { Text, type TextTone } from './Text';

export type ButtonVariant =
  | 'primario'
  | 'secundario'
  | 'contorno'
  | 'fantasma'
  | 'destrutivo'
  | 'destrutivo-suave';
export type ButtonSize = 'grande' | 'medio';

const container: Record<ButtonVariant, string> = {
  primario: 'bg-acento active:bg-acento-pressionado',
  secundario: 'bg-superficie-alt active:bg-acento-suave',
  contorno: 'border border-linha-controle active:bg-superficie-alt',
  fantasma: 'active:bg-superficie-alt',
  destrutivo: 'bg-erro active:opacity-90',
  'destrutivo-suave': 'bg-erro-suave active:opacity-80',
};

const label: Record<ButtonVariant, TextTone> = {
  primario: 'sobre-acento',
  secundario: 'texto',
  contorno: 'texto',
  fantasma: 'texto',
  destrutivo: 'sobre-erro',
  'destrutivo-suave': 'erro',
};

const content: Record<ButtonVariant, string> = {
  primario: colors['sobre-acento'],
  secundario: colors.texto,
  contorno: colors.texto,
  fantasma: colors.texto,
  destrutivo: colors['sobre-erro'],
  'destrutivo-suave': colors.erro,
};

const sizes: Record<ButtonSize, string> = {
  grande: 'h-[52px] px-5',
  medio: 'h-[44px] px-4',
};

type Props = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: Icon;
  loading?: boolean;
  fullWidth?: boolean;
};

export function Button({
  label: text,
  variant = 'primario',
  size = 'grande',
  icon: IconComponent,
  loading = false,
  fullWidth = true,
  disabled,
  className,
  ...rest
}: Props) {
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={text}
      accessibilityState={{ disabled: !!inactive, busy: loading }}
      disabled={inactive}
      className={[
        'flex-row items-center justify-center gap-2 rounded-md',
        container[variant],
        sizes[size],
        fullWidth ? 'self-stretch' : 'self-start',
        disabled ? 'opacity-40' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}>
      {loading ? (
        <ActivityIndicator size="small" color={content[variant]} />
      ) : IconComponent ? (
        <IconComponent size={20} color={content[variant]} />
      ) : null}
      <Text variant="botao" tone={label[variant]}>
        {text}
      </Text>
    </Pressable>
  );
}
