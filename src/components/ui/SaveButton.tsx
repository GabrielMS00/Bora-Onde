import { BookmarkSimple } from 'phosphor-react-native';
import { useState } from 'react';
import { Animated, Pressable } from 'react-native';

import { colors } from '@/theme/tokens';

type Props = {
  saved: boolean;
  placeName: string;
  onPress: () => void;
  className?: string;
};

export function SaveButton({ saved, placeName, onPress, className }: Props) {
  const [scale] = useState(() => new Animated.Value(1));

  const press = () => {
    if (!saved) {
      scale.setValue(0.7);
      Animated.spring(scale, { toValue: 1, friction: 3, tension: 160, useNativeDriver: true }).start();
    }
    onPress();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={saved ? `Remover ${placeName} dos salvos` : `Salvar ${placeName}`}
      accessibilityState={{ selected: saved }}
      onPress={press}
      className={`h-11 w-11 items-center justify-center rounded-pilula active:bg-superficie-alt ${className ?? ''}`}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <BookmarkSimple size={24} weight={saved ? 'fill' : 'regular'} color={colors.texto} />
      </Animated.View>
    </Pressable>
  );
}
