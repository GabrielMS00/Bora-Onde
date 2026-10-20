import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { BookmarkSimple, Check, Sparkle, X } from 'phosphor-react-native';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Badge, InfoBox } from '@/components/ui/Notices';
import { PlaceCard } from '@/components/ui/PlaceCard';
import { Screen } from '@/components/ui/Screen';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/StateView';
import { Text } from '@/components/ui/Text';
import type { Place } from '@/data/types';
import { useFavorites, useToggleFavorite } from '@/features/favorites/useFavorites';
import { usePlaces } from '@/features/feed/usePlaces';
import { useMyUser } from '@/features/profile/useMyUser';
import {
  describeAnswers,
  matchCriteria,
  missingSpecialty,
  parseAnswers,
  recommend,
  type Criterion,
  type QuizAnswers,
} from '@/features/recommendation/engine';
import { specialtyPhrase } from '@/lib/place';
import { colors } from '@/theme/tokens';

const redo = () => router.dismissTo('/recommend');
const backToFeed = () => router.navigate('/feed');

function CriterionChip({ label, met }: Criterion) {
  return (
    <View
      accessibilityLabel={`${met ? 'Atende' : 'Não atende'}: ${label}`}
      className={`h-7 flex-row items-center gap-1 rounded-pilula px-[10px] ${met ? 'bg-sucesso-suave' : 'border border-linha bg-superficie'}`}>
      {met ? <Check size={14} weight="bold" color={colors.sucesso} /> : <X size={14} color={colors['texto-secundario']} />}
      <Text variant="tag" tone={met ? 'sucesso' : 'secundario'}>
        {label}
      </Text>
    </View>
  );
}

function ResultView({ places, answers, city, savedIds }: { places: Place[]; answers: QuizAnswers; city: string; savedIds: ReadonlySet<string> }) {
  const toggleFavorite = useToggleFavorite();
  const [rankingSaved] = useState(() => savedIds);
  const [excluded, setExcluded] = useState<string[]>([]);

  const current = useMemo(() => recommend(places, answers, excluded, rankingSaved), [places, answers, excluded, rankingSaved]);
  const hasMore = useMemo(
    () => (current ? recommend(places, answers, [...excluded, current.id], rankingSaved) !== null : false),
    [places, answers, excluded, current, rankingSaved],
  );
  const missing = useMemo(() => missingSpecialty(places, answers), [places, answers]);

  if (!current) {
    return (
      <Screen background="pedra" safeBottom={false}>
        <View className="pt-6">
          <EmptyState
            title="Nenhum lugar encontrado"
            message={`Nenhum lugar de ${city} atende às suas respostas (${describeAnswers(answers)}). Tente mudar o tipo ou a bebida.`}
            actionLabel="Refazer o questionário"
            onAction={redo}
          />
          <View className="px-4 pt-2">
            <Button label="Voltar ao feed" variant="fantasma" size="medio" onPress={backToFeed} />
          </View>
        </View>
      </Screen>
    );
  }

  const another = () => (hasMore ? setExcluded((ids) => [...ids, current.id]) : redo());
  const criteria = matchCriteria(current, answers);
  const perfect = criteria.every((c) => c.met);
  const saved = savedIds.has(current.id);

  return (
    <Screen
      background="pedra"
      safeBottom={false}
      footer={
        <View className="gap-2">
          <Button label={hasMore ? 'Tentar outra indicação' : 'Refazer o questionário'} icon={Sparkle} onPress={another} />
          <Button label="Voltar ao feed" variant="fantasma" size="medio" onPress={backToFeed} />
        </View>
      }>
      <View className="gap-4 pt-3">
        <Badge label={perfect ? 'Match ideal pra hoje' : 'Boa opção pra hoje'} />
        <View className="gap-3">
          <Text variant="h1">Bora no {current.name}?</Text>
          <Text variant="corpo" tone="secundario">
            {perfect ? 'Combina com tudo o que você pediu:' : 'É o que mais combina com o que você pediu:'}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {criteria.map((c) => (
              <CriterionChip key={c.label} {...c} />
            ))}
            {saved ? (
              <View className="h-7 flex-row items-center gap-1 rounded-pilula bg-superficie px-[10px]">
                <BookmarkSimple size={14} weight="fill" color={colors.texto} />
                <Text variant="tag">Nos seus salvos</Text>
              </View>
            ) : null}
          </View>
        </View>
        {missing ? (
          <InfoBox>
            Não achamos {specialtyPhrase[missing]} em {city}, então indicamos o lugar que mais combina com o resto do que você pediu.
          </InfoBox>
        ) : null}
        <PlaceCard place={current} variant="destaque" saved={saved} onToggleSave={() => toggleFavorite(current, saved)} />
      </View>
    </Screen>
  );
}

export default function RecommendResultScreen() {
  const params = useLocalSearchParams<{ type?: string; specialty?: string; vibe?: string; atmosphere?: string; alcohol?: string }>();
  const answers = useMemo(() => parseAnswers(params), [params]);

  const user = useMyUser();
  const { places, isError, refetch } = usePlaces(user.data?.city);
  const favorites = useFavorites();

  if (!answers) return <Redirect href="/recommend" />;

  if (places && !favorites.isLoading) {
    return <ResultView places={places} answers={answers} city={user.data?.city.split(',')[0] ?? 'sua cidade'} savedIds={favorites.savedIds} />;
  }

  return (
    <Screen background="pedra" safeBottom={false}>
      {user.isError || isError ? (
        <ErrorState message="Não foi possível carregar as indicações." actionLabel="Tentar novamente" onAction={() => (user.isError ? user.refetch() : refetch())} />
      ) : (
        <View className="gap-4 pt-3">
          <Skeleton className="h-7 w-44 rounded-pilula" />
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="aspect-[3/2] w-full" />
        </View>
      )}
    </Screen>
  );
}
