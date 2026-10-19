import { MapPin, Wine, ForkKnife, Coffee, type Icon } from 'phosphor-react-native';
import { useState } from 'react';
import { FlatList, View, type LayoutChangeEvent } from 'react-native';

import type { Place, PlaceType } from '@/data/types';
import { formatAddress, formatMeta, placeTags } from '@/lib/place';
import { colors, shadows } from '@/theme/tokens';

import { Chip } from './Chip';
import { PhotoFrame } from './Photo';
import { Text } from './Text';

// Figma › Card do lugar. Feed: foto 4:5 em carrossel (rolagem horizontal) com indicador, nome em h2, metadados,
// endereço completo e até três tags. Destaque: versão do resultado da Indicação (foto 3:2, raio-xl, sombra-2).
// Nada de texto sobre a foto. (Preço, "aberto até", distância e salvar ficam fora do escopo.)

const typeIcon: Record<PlaceType, Icon> = { restaurant: ForkKnife, cafe: Coffee, bar: Wine };

type Props = {
  place: Place;
  variant?: 'feed' | 'destaque';
  /** Linha de apoio do Destaque, ex.: "Combina com o que você pediu". */
  caption?: string;
};

export function PlaceCard({ place, variant = 'feed', caption }: Props) {
  const destaque = variant === 'destaque';
  const ratio = destaque ? '3:2' : '4:5';
  const aspect = destaque ? 3 / 2 : 4 / 5;
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const tags = placeTags(place);

  // A página do carrossel precisa ter exatamente a largura do viewport: medida dentro da borda do card e sem
  // arredondar, senão cada foto sobra alguns px e a anterior "vaza" para a seguinte a cada página.
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const address = (
    <View className="flex-row items-start gap-2">
      <MapPin size={14} color={colors['texto-secundario']} style={{ marginTop: 1 }} />
      <Text variant="legenda" tone="secundario" className="flex-1">
        {formatAddress(place)}
      </Text>
    </View>
  );
  const tagRow = tags.length ? (
    <View className="flex-row flex-wrap gap-2">
      {tags.map((tag) => (
        <Chip key={tag.label} variant="tag" label={tag.label} icon={tag.type ? typeIcon[tag.type] : undefined} />
      ))}
    </View>
  ) : null;

  return (
    <View
      className={destaque ? 'rounded-xl' : ''}
      style={destaque ? { boxShadow: shadows['sombra-2'] } : undefined}
      accessibilityLabel={`${place.name}. ${formatMeta(place)}`}>
      <View className="overflow-hidden rounded-xl border border-linha bg-superficie">
        <View onLayout={onLayout}>
          {width > 0 && place.photos.length > 1 ? (
            <FlatList
              data={place.photos}
              keyExtractor={(uri) => uri}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
              getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
              renderItem={({ item }) => (
                <View style={{ width, height: width / aspect }}>
                  <PhotoFrame uri={item} ratio={ratio} accessibilityLabel={`Foto de ${place.name}`} />
                </View>
              )}
            />
          ) : (
            <PhotoFrame uri={place.photos[0]} ratio={ratio} accessibilityLabel={`Foto de ${place.name}`} />
          )}
        </View>

        {place.photos.length > 1 ? (
          <View className="flex-row items-center justify-center gap-[6px] pt-3" accessibilityElementsHidden>
            {place.photos.map((uri, i) => (
              <View
                key={uri}
                className={`h-[6px] rounded-pilula ${i === index ? 'w-4 bg-acento' : 'w-[6px] bg-linha-controle'}`}
              />
            ))}
          </View>
        ) : null}

        <View className="gap-1 p-4">
          <Text variant="h2">{place.name}</Text>
          <Text variant="corpo-sm" tone="secundario">
            {formatMeta(place)}
          </Text>
          {destaque ? (
            <>
              {caption ? (
                <Text variant="legenda" tone="secundario" className="mt-1">
                  {caption}
                </Text>
              ) : null}
              <View className="mt-2 gap-3">
                {tagRow}
                {address}
              </View>
            </>
          ) : (
            <View className="mt-2 gap-3">
              {address}
              {tagRow}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
