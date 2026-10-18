import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Sparkle } from 'phosphor-react-native';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Notices';
import { PlaceCard } from '@/components/ui/PlaceCard';
import { Screen } from '@/components/ui/Screen';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/StateView';
import { Text } from '@/components/ui/Text';
import { usePlaces } from '@/features/feed/usePlaces';
import { useMyUser } from '@/features/profile/useMyUser';
import { describeAnswers, parseAnswers, recommend } from '@/features/recommendation/engine';

// 2.3 Resultado da indicação. As respostas chegam pela rota; "Tentar outra indicação" acumula os já mostrados.
export default function RecommendResultScreen() {
  const params = useLocalSearchParams<{ type?: string; vibe?: string; alcohol?: string }>();
  const answers = useMemo(() => parseAnswers(params), [params]);

  const user = useMyUser();
  const { places, isLoading, isError, refetch } = usePlaces(user.data?.city);
  const [excluded, setExcluded] = useState<string[]>([]);

  const current = useMemo(() => (places && answers ? recommend(places, answers, excluded) : null), [places, answers, excluded]);
  const hasMore = useMemo(
    () => (places && answers && current ? recommend(places, answers, [...excluded, current.id]) !== null : false),
    [places, answers, excluded, current],
  );

  // URL adulterada ou aberta direto: volta ao questionário.
  if (!answers) return <Redirect href="/recommend" />;

  const redo = () => router.dismissTo('/recommend');
  const another = () => {
    if (!current) return;
    if (hasMore) setExcluded((ids) => [...ids, current.id]);
    else redo();
  };

  const loading = user.isLoading || isLoading;
  const city = user.data?.city.split(',')[0] ?? 'sua cidade';

  return (
    <Screen
      background="pedra"
      safeBottom={false}
      footer={
        current ? (
          <View className="gap-2">
            <Button label={hasMore ? 'Tentar outra indicação' : 'Refazer o questionário'} icon={Sparkle} onPress={another} />
            <Button label="Voltar ao feed" variant="fantasma" size="medio" onPress={() => router.navigate('/feed')} />
          </View>
        ) : undefined
      }>
      {loading ? (
        <View className="gap-4 pt-3">
          <Skeleton className="h-7 w-44 rounded-pilula" />
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="aspect-[3/2] w-full" />
        </View>
      ) : user.isError || isError ? (
        <ErrorState message="Não foi possível carregar as indicações." actionLabel="Tentar novamente" onAction={() => (user.isError ? user.refetch() : refetch())} />
      ) : current ? (
        <View className="gap-4 pt-3">
          <Badge label="Match ideal pra hoje" />
          <View className="gap-2">
            <Text variant="h1">Bora no {current.name}?</Text>
            <Text variant="corpo" tone="secundario">
              Encontramos o lugar ideal pra você, com base em: {describeAnswers(answers)}.
            </Text>
          </View>
          <PlaceCard place={current} variant="destaque" caption="Combina com o que você pediu" />
        </View>
      ) : (
        <View className="pt-6">
          <EmptyState
            title="Nenhum lugar encontrado"
            message={`Nenhum lugar de ${city} atende às suas respostas (${describeAnswers(answers)}). Tente mudar o tipo ou a vibe.`}
            actionLabel="Refazer o questionário"
            onAction={redo}
          />
          <View className="px-4 pt-2">
            <Button label="Voltar ao feed" variant="fantasma" size="medio" onPress={() => router.navigate('/feed')} />
          </View>
        </View>
      )}
    </Screen>
  );
}
