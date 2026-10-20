import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { PlaceCard } from '@/components/ui/PlaceCard';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ErrorState, Skeleton } from '@/components/ui/StateView';
import { useFavorites, useSavedPlace, useToggleFavorite } from '@/features/favorites/useFavorites';

export default function SavedPlaceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: place, isLoading, isError, refetch } = useSavedPlace(id);
  const { savedIds } = useFavorites();
  const toggleFavorite = useToggleFavorite();

  return (
    <Screen header={<ScreenHeader title="Lugar salvo" />} safeBottom={false}>
      {place ? (
        <View className="pt-2">
          <PlaceCard place={place} saved={savedIds.has(place.id)} onToggleSave={() => toggleFavorite(place, savedIds.has(place.id))} />
        </View>
      ) : isLoading ? (
        <View className="gap-4 pt-2">
          <Skeleton className="aspect-[4/5] w-full rounded-xl" />
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </View>
      ) : isError ? (
        <ErrorState message="Não foi possível carregar este lugar. Ele pode ter sido removido do Bora Onde." actionLabel="Tentar novamente" onAction={() => refetch()} />
      ) : null}
    </Screen>
  );
}
