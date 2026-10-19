import { router } from 'expo-router';
import { CaretDown, Coffee, Eye, ForkKnife, MapPin, Wine, type Icon } from 'phosphor-react-native';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Chip } from '@/components/ui/Chip';
import { Logo } from '@/components/ui/Logo';
import { PlaceCard } from '@/components/ui/PlaceCard';
import { Screen } from '@/components/ui/Screen';
import { ListOption, OptionList } from '@/components/ui/Selectors';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/StateView';
import { Text } from '@/components/ui/Text';
import type { PlaceType, Vibe } from '@/data/types';
import { useMyPlace } from '@/features/establishment/useMyPlace';
import { useMyUser } from '@/features/profile/useMyUser';
import { placeTypeLabel, vibeLabel } from '@/lib/place';
import { colors } from '@/theme/tokens';

import { NO_FILTERS, filterPlaces, hasFilters, resultLabel, type FeedFilters } from './filters';
import { usePlaces } from './usePlaces';

const typeChips: { type: PlaceType; icon: Icon }[] = [
  { type: 'restaurant', icon: ForkKnife },
  { type: 'cafe', icon: Coffee },
  { type: 'bar', icon: Wine },
];
const vibes: Vibe[] = ['family', 'friends', 'romantic'];

function FeedSkeleton() {
  return (
    <View className="gap-6">
      {[0, 1].map((i) => (
        <View key={i} className="overflow-hidden rounded-xl border border-linha bg-superficie">
          <Skeleton className="aspect-[4/5] w-full rounded-none" />
          <View className="gap-2 p-4">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
          </View>
        </View>
      ))}
    </View>
  );
}

export function FeedScreen({ mode }: { mode: 'user' | 'establishment' }) {
  const [filters, setFilters] = useState<FeedFilters>(NO_FILTERS);
  const [vibeSheet, setVibeSheet] = useState(false);

  const user = useMyUser();
  const mine = useMyPlace();
  const context = mode === 'user' ? user : mine;
  const city = mode === 'user' ? user.data?.city : mine.data?.city;

  const placesQuery = usePlaces(city);
  const { places } = placesQuery;
  const visible = useMemo(() => (places ? filterPlaces(places, filters) : []), [places, filters]);

  const loading = context.isLoading || (!!city && placesQuery.isLoading);
  const failed = context.isError || placesQuery.isError;
  const retry = () => {
    if (context.isError) context.refetch();
    if (placesQuery.isError) placesQuery.refetch();
  };

  const cityName = city?.split(',')[0] ?? '';
  const filtered = hasFilters(filters);
  const setType = (type: PlaceType | null) => setFilters((f) => ({ ...f, type }));

  const header = (
    <View className="gap-4 pb-4 pt-2">
      {mode === 'establishment' ? (
        <View className="flex-row items-start gap-3 rounded-lg border border-linha bg-superficie p-4">
          <View className="h-9 w-9 items-center justify-center rounded-pilula bg-superficie-alt">
            <Eye size={18} color={colors.texto} />
          </View>
          <View className="flex-1 gap-2">
            <Text variant="corpo-sm">
              Veja como o {mine.data?.name ?? 'seu local'} aparece para quem procura lugares em {cityName}.
            </Text>
            <Pressable accessibilityRole="link" accessibilityLabel="Editar perfil do local" hitSlop={8} onPress={() => router.navigate('/place-profile')} className="self-start">
              <Text variant="rotulo-forte" className="underline">
                Editar perfil do local
              </Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View className="gap-1">
          <Text variant="h1">Perto de você</Text>
          {places ? (
            <Text variant="corpo-sm" tone="secundario">
              {places.length} {places.length === 1 ? 'lugar' : 'lugares'} em {cityName}
            </Text>
          ) : null}
        </View>
      )}

      {filtered && places ? (
        <View className="flex-row items-center justify-between">
          <Text variant="rotulo-forte">{resultLabel(filters, visible.length)}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Limpar filtros" hitSlop={8} onPress={() => setFilters(NO_FILTERS)}>
            <Text variant="rotulo-forte" className="underline">
              Limpar filtros
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );

  return (
    <Screen scroll={false} padded={false} safeBottom={false}>
      <View className="h-14 flex-row items-center justify-between px-5">
        <Logo variant="horizontal" height={22} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Cidade: ${city ?? ''}`}
          onPress={() => router.navigate(mode === 'user' ? '/profile' : '/place-profile')}
          className="h-[38px] flex-row items-center gap-2 rounded-pilula border border-linha bg-superficie px-3 active:bg-superficie-alt">
          <MapPin size={16} color={colors.texto} />
          <Text variant="rotulo-forte">{city ?? '…'}</Text>
          <CaretDown size={16} color={colors.texto} />
        </Pressable>
      </View>

      <View className="h-[52px] justify-center">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="items-center gap-2 px-5">
          <Chip label="Todos" selected={filters.type === null} onPress={() => setType(null)} />
          {typeChips.map(({ type, icon }) => (
            <Chip key={type} label={placeTypeLabel[type]} icon={icon} selected={filters.type === type} onPress={() => setType(filters.type === type ? null : type)} />
          ))}
          <Chip label={filters.vibe ? vibeLabel[filters.vibe] : 'Ambiente'} dropdown selected={filters.vibe !== null} onPress={() => setVibeSheet(true)} />
          <Chip label="Com álcool" selected={filters.alcohol} onPress={() => setFilters((f) => ({ ...f, alcohol: !f.alcohol }))} />
        </ScrollView>
      </View>

      {failed ? (
        <ErrorState message="Não foi possível carregar os lugares. Verifique a conexão." actionLabel="Tentar novamente" onAction={retry} />
      ) : (
        <FlatList
          data={loading ? [] : visible}
          keyExtractor={(p) => p.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          refreshing={placesQuery.isRefetching}
          onRefresh={() => placesQuery.refetch()}
          ListHeaderComponent={header}
          ItemSeparatorComponent={() => <View className="h-6" />}
          renderItem={({ item }) => <PlaceCard place={item} />}
          ListEmptyComponent={
            loading ? (
              <FeedSkeleton />
            ) : filtered ? (
              <EmptyState
                title="Nenhum lugar encontrado"
                message={`Nenhum lugar corresponde a esses filtros em ${cityName}.`}
                actionLabel="Limpar filtros"
                onAction={() => setFilters(NO_FILTERS)}
              />
            ) : (
              <EmptyState title={`Ainda não há lugares em ${cityName}`} message="Assim que um estabelecimento se cadastrar na sua cidade, ele aparece aqui." />
            )
          }
        />
      )}

      <BottomSheet visible={vibeSheet} title="Ambiente" onClose={() => setVibeSheet(false)}>
        <OptionList>
          <ListOption
            type="radio"
            label="Qualquer ambiente"
            selected={filters.vibe === null}
            onPress={() => {
              setFilters((f) => ({ ...f, vibe: null }));
              setVibeSheet(false);
            }}
          />
          {vibes.map((vibe) => (
            <ListOption
              key={vibe}
              type="radio"
              label={vibeLabel[vibe]}
              selected={filters.vibe === vibe}
              onPress={() => {
                setFilters((f) => ({ ...f, vibe }));
                setVibeSheet(false);
              }}
            />
          ))}
        </OptionList>
      </BottomSheet>
    </Screen>
  );
}
