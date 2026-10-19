import { Image } from 'expo-image';
import { Image as ImageIcon, Plus, X } from 'phosphor-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { colors, shadows } from '@/theme/tokens';

import { Text } from './Text';

export type PhotoRatio = '4:5' | '3:2' | '1:1';
const ratios: Record<PhotoRatio, number> = { '4:5': 4 / 5, '3:2': 3 / 2, '1:1': 1 };

type FrameProps = {
  uri?: string;
  ratio?: PhotoRatio;
  className?: string;
  accessibilityLabel?: string;
};

export function PhotoFrame({ uri, ratio = '4:5', className, accessibilityLabel }: FrameProps) {
  const [failedUri, setFailedUri] = useState<string>();
  return (
    <View className={`w-full items-center justify-center overflow-hidden bg-superficie-alt ${className ?? ''}`} style={{ aspectRatio: ratios[ratio] }}>
      {uri && failedUri !== uri ? (
        <Image
          source={{ uri }}
          contentFit="cover"
          transition={200}
          style={{ width: '100%', height: '100%' }}
          accessibilityLabel={accessibilityLabel}
          onError={() => setFailedUri(uri)}
        />
      ) : (
        <ImageIcon size={24} color={colors['texto-secundario']} />
      )}
    </View>
  );
}

type ThumbProps = {
  uri?: string;
  size?: number;
  onRemove?: () => void;
};

export function PhotoThumb({ uri, size = 96, onRemove }: ThumbProps) {
  const [failedUri, setFailedUri] = useState<string>();
  return (
    <View style={{ width: size, height: size }} className="items-center justify-center overflow-hidden rounded-md bg-superficie-alt">
      {uri && failedUri !== uri ? (
        <Image source={{ uri }} contentFit="cover" transition={200} style={{ width: size, height: size }} onError={() => setFailedUri(uri)} />
      ) : (
        <ImageIcon size={20} color={colors['texto-secundario']} />
      )}
      {onRemove ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Remover foto"
          hitSlop={8}
          onPress={onRemove}
          className="absolute right-[6px] top-[6px] h-[22px] w-[22px] items-center justify-center rounded-pilula bg-superficie"
          style={{ boxShadow: shadows['sombra-1'] }}>
          <X size={12} weight="bold" color={colors.texto} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function AddPhotoTile({ onPress, size = 96, label = 'Adicionar' }: { onPress: () => void; size?: number; label?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Adicionar fotos"
      onPress={onPress}
      style={{ width: size, height: size, borderStyle: 'dashed' }}
      className="items-center justify-center gap-1 rounded-md border-[1.5px] border-linha-controle bg-superficie active:bg-superficie-alt">
      <Plus size={24} color={colors.texto} />
      <Text variant="legenda">{label}</Text>
    </Pressable>
  );
}
