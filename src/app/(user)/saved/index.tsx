import { router } from 'expo-router';
import { BookmarkSimple } from 'phosphor-react-native';
import { FlatList, Pressable, View } from 'react-native';

import { PhotoThumb } from '@/components/ui/Photo';
import { SaveButton } from '@/components/ui/SaveButton';
import { Screen } from '@/components/ui/Screen';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/StateView';
import { Text } from '@/components/ui/Text';
import type { Place } from '@/data/types';
import { useFavorites, useToggleFavorite } from '@/features/favorites/useFavorites';
import { formatMeta } from '@/lib/place';

const THUMB = 64;

function SavedRow({ place, onRemove }: { place: Place; onRemove: () => void }) {
  return (
    <View className="flex-row items-center overflow-hidden rounded-lg border border-linha bg-superficie">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Abrir ${place.name}. ${formatMeta(place)}. ${place.city}`}
        onPress={() => router.push({ pathname: '/saved/[id]', params: { id: place.id } })}
        className="flex-1 flex-row items-center gap-3 p-3 active:bg-superficie-alt">
        <PhotoThumb uri={place.photos[0]} size={THUMB} />
        <View className="flex-1 gap-[2px]">
          <Text variant="h3" numberOfLines={1}>
            {place.name}
          </Text>
          <Text variant="corpo-sm" tone="secundario" numberOfLines={1}>
            {formatMeta(place)}
          </Text>
          <Text variant="legenda" tone="secundario" numberOfLines={1}>
            {place.city}
          </Text>
        </View>
      </Pressable>
      <SaveButton saved placeName={place.name} onPress={onRemove} className="mr-1" />
    </View>
  );
}

function SavedSkeleton() {
  return (
    <View className="gap-3">
      {[0, 1, 2, 3].map((i) => (
        <View key={i} className="flex-row items-center gap-3 rounded-lg border border-linha bg-superficie p-3">
          <Skeleton className="h-16 w-16" />
          <View className="flex-1 gap-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </View>
        </View>
      ))}
    </View>
  );
}

export default function SavedScreen() {
  const { data: places, isLoading, isError, isRefetching, refetch } = useFavorites();
  const toggleFavorite = useToggleFavorite();

  return (
    <Screen scroll={false} padded={false} safeBottom={false}>
      {isError ? (
        <ErrorState message="Não foi possível carregar os seus lugares salvos." actionLabel="Tentar novamente" onAction={() => refetch()} />
      ) : (
        <FlatList
          data={places ?? []}
          keyExtractor={(p) => p.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          refreshing={isRefetching}
          onRefresh={() => refetch()}
          ListHeaderComponent={
            <View className="gap-1 pb-4 pt-2">
              <Text variant="h1">Salvos</Text>
              {places?.length ? (
                <Text variant="corpo-sm" tone="secundario">
                  {places.length} {places.length === 1 ? 'lugar salvo' : 'lugares salvos'}
                </Text>
              ) : null}
            </View>
          }
          ItemSeparatorComponent={() => <View className="h-3" />}
          renderItem={({ item }) => <SavedRow place={item} onRemove={() => toggleFavorite(item, true)} />}
          ListEmptyComponent={
            isLoading ? (
              <SavedSkeleton />
            ) : (
              <EmptyState
                icon={BookmarkSimple}
                title="Nenhum lugar salvo ainda"
                message="Toque no ícone de salvar nos cards do feed para guardar os lugares que te interessam."
                actionLabel="Explorar o feed"
                onAction={() => router.navigate('/feed')}
              />
            )
          }
        />
      )}
    </Screen>
  );
}
