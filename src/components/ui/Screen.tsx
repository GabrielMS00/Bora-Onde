import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { layout } from '@/theme/tokens';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  padded?: boolean;
  safeBottom?: boolean;
  background?: 'fundo' | 'pedra';
  className?: string;
};

export function Screen({ children, scroll = true, header, footer, padded = true, safeBottom = true, background = 'fundo', className }: Props) {
  const insets = useSafeAreaInsets();
  const px = padded ? layout.margem : 0;

  return (
    <KeyboardAvoidingView
      className={`flex-1 ${background === 'pedra' ? 'bg-superficie-alt' : 'bg-fundo'}`}
      style={{ paddingTop: insets.top }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {header}
      {scroll ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: px, paddingBottom: footer ? 16 : 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View className={className}>{children}</View>
        </ScrollView>
      ) : (
        <View className={`flex-1 ${className ?? ''}`} style={{ paddingHorizontal: px }}>
          {children}
        </View>
      )}
      {footer ? (
        <View style={{ paddingHorizontal: layout.margem, paddingBottom: safeBottom ? Math.max(insets.bottom, 12) : 12, paddingTop: 12 }}>
          {footer}
        </View>
      ) : safeBottom ? (
        <View style={{ height: insets.bottom }} />
      ) : null}
    </KeyboardAvoidingView>
  );
}
