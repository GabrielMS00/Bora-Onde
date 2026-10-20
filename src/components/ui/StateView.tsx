import { MagnifyingGlass, WarningCircle, type Icon } from 'phosphor-react-native';
import { Animated, View } from 'react-native';
import { useEffect, useState } from 'react';

import { colors } from '@/theme/tokens';

import { Button } from './Button';
import { Text } from './Text';

type StateProps = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

function StateView({ icon: IconComponent, tone, title, message, actionLabel, onAction }: StateProps & { icon: Icon; tone: 'neutro' | 'erro' }) {
  return (
    <View className="items-center gap-3 px-6 py-10">
      <View className={`h-14 w-14 items-center justify-center rounded-pilula ${tone === 'erro' ? 'bg-erro-suave' : 'bg-superficie-alt'}`}>
        <IconComponent size={26} color={tone === 'erro' ? colors.erro : colors['texto-secundario']} />
      </View>
      <Text variant="h3" className="text-center">
        {title}
      </Text>
      <Text variant="corpo-sm" tone="secundario" className="text-center">
        {message}
      </Text>
      {actionLabel && onAction ? (
        <View className="mt-2 self-stretch px-4">
          <Button label={actionLabel} variant="contorno" size="medio" onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

export function EmptyState({ icon = MagnifyingGlass, ...props }: StateProps & { icon?: Icon }) {
  return <StateView icon={icon} tone="neutro" {...props} />;
}

export function ErrorState(props: Omit<StateProps, 'title'> & { title?: string }) {
  return <StateView icon={WarningCircle} tone="erro" title={props.title ?? 'Algo deu errado'} {...props} />;
}

export function Skeleton({ className }: { className?: string }) {
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View accessibilityElementsHidden style={{ opacity }}>
      <View className={`rounded-md bg-superficie-alt ${className ?? ''}`} />
    </Animated.View>
  );
}
