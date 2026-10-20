import { CheckCircle, WarningCircle } from 'phosphor-react-native';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Animated, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, shadows } from '@/theme/tokens';

import { Text } from './Text';

type ToastType = 'success' | 'error';
type ToastState = { id: number; type: ToastType; message: string };

const ToastContext = createContext<{ show: (type: ToastType, message: string) => void } | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast deve ser usado dentro de <ToastProvider>');
  return ctx;
}

const TOAST_DURATION_MS = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const counter = useRef(0);

  const show = useCallback((type: ToastType, message: string) => {
    counter.current += 1;
    setToast({ id: counter.current, type, message });
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? <ToastView key={toast.id} toast={toast} onDone={() => setToast(null)} /> : null}
    </ToastContext.Provider>
  );
}

function ToastView({ toast, onDone }: { toast: ToastState; onDone: () => void }) {
  const insets = useSafeAreaInsets();
  const [opacity] = useState(() => new Animated.Value(0));
  const success = toast.type === 'success';

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(onDone);
    }, TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [opacity, onDone]);

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={{ opacity, position: 'absolute', left: 20, right: 20, top: insets.top + 8 }}>
      <View className="flex-row items-start gap-3 rounded-lg border border-linha bg-superficie p-4" style={{ boxShadow: shadows['sombra-2'] }}>
        <View className={`h-6 w-6 items-center justify-center rounded-pilula ${success ? 'bg-sucesso-suave' : 'bg-erro-suave'}`}>
          {success ? (
            <CheckCircle size={20} weight="fill" color={colors.sucesso} />
          ) : (
            <WarningCircle size={20} weight="fill" color={colors.erro} />
          )}
        </View>
        <View className="flex-1 gap-[2px]">
          <Text variant="rotulo-forte" tone={success ? 'sucesso' : 'erro'}>
            {success ? 'Sucesso' : 'Erro'}
          </Text>
          <Text variant="corpo-sm">{toast.message}</Text>
        </View>
      </View>
    </Animated.View>
  );
}
