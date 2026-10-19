import { useQueryClient } from '@tanstack/react-query';
import { Coffee, ForkKnife, Wine } from 'phosphor-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { InfoBox } from '@/components/ui/Notices';
import { Screen } from '@/components/ui/Screen';
import { ListOption, OptionBlock, OptionList, Segmented } from '@/components/ui/Selectors';
import { ErrorState, Skeleton } from '@/components/ui/StateView';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { saveMetadata } from '@/data/api/placesApi';
import type { Place, PlaceType, Vibe } from '@/data/types';
import { useMyPlace } from '@/features/establishment/useMyPlace';

const TYPES: { type: PlaceType; label: string; icon: typeof Wine }[] = [
  { type: 'restaurant', label: 'Restaurante', icon: ForkKnife },
  { type: 'cafe', label: 'Cafeteria', icon: Coffee },
  { type: 'bar', label: 'Bar', icon: Wine },
];
const VIBES: { vibe: Vibe; label: string }[] = [
  { vibe: 'family', label: 'Familiar' },
  { vibe: 'friends', label: 'Amigos' },
  { vibe: 'romantic', label: 'Encontros românticos' },
];
const ALCOHOL = [
  { value: 'yes', label: 'Sim' },
  { value: 'no', label: 'Não' },
] as const;

type Alcohol = (typeof ALCOHOL)[number]['value'];
type Errors = { type?: string; vibes?: string; alcohol?: string };

function SectionTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <View className="flex-row flex-wrap items-baseline gap-x-2">
      <Text variant="h3" accessibilityRole="header">
        {title}
      </Text>
      {hint ? (
        <Text variant="legenda" tone="secundario">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

function SetupForm({ place }: { place: Place }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const meta = place.metadata;

  const [type, setType] = useState<PlaceType | undefined>(meta?.type);
  const [vibes, setVibes] = useState<Vibe[]>(meta?.vibes ?? []);
  const [alcohol, setAlcohol] = useState<Alcohol | undefined>(meta?.sellsAlcohol === undefined ? undefined : meta.sellsAlcohol ? 'yes' : 'no');
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  const toggleVibe = (vibe: Vibe) => {
    setVibes((cur) => (cur.includes(vibe) ? cur.filter((v) => v !== vibe) : [...cur, vibe]));
    setErrors((e) => ({ ...e, vibes: undefined }));
  };

  const save = async () => {
    const next: Errors = {
      type: type ? undefined : 'Escolha o tipo de estabelecimento.',
      vibes: vibes.length > 0 ? undefined : 'Marque ao menos um ambiente.',
      alcohol: alcohol ? undefined : 'Informe se vende bebida alcoólica.',
    };
    setErrors(next);
    if (next.type || next.vibes || next.alcohol || !type || !alcohol) return;

    setSaving(true);
    try {
      await saveMetadata(place.id, { type, vibes, sellsAlcohol: alcohol === 'yes' });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['my-place'] }),
        queryClient.invalidateQueries({ queryKey: ['places'] }),
      ]);
      toast.show('success', `Configurações de indicação salvas. O ${place.name} já pode ser indicado.`);
    } catch {
      toast.show('error', 'Não foi possível salvar as configurações. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen safeBottom={false} footer={<Button label="Salvar configurações" onPress={save} loading={saving} />}>
      <View className="gap-6 pt-2">
        <Text variant="h1">Configurar indicação</Text>
        <InfoBox>Estes dados decidem quando o {place.name} é indicado no questionário dos usuários.</InfoBox>

        <View className="gap-3">
          <SectionTitle title="Tipo de estabelecimento" hint="Escolha um" />
          <View className="flex-row gap-2">
            {TYPES.map((t) => (
              <OptionBlock
                key={t.type}
                label={t.label}
                icon={t.icon}
                selected={type === t.type}
                onPress={() => {
                  setType(t.type);
                  setErrors((e) => ({ ...e, type: undefined }));
                }}
              />
            ))}
          </View>
          {errors.type ? (
            <Text variant="corpo-sm" tone="erro">
              {errors.type}
            </Text>
          ) : null}
        </View>

        <View className="gap-3">
          <SectionTitle title="Tipo de ambiente (vibe)" hint="Marque todas que se aplicam" />
          <OptionList>
            {VIBES.map((v) => (
              <ListOption key={v.vibe} label={v.label} selected={vibes.includes(v.vibe)} onPress={() => toggleVibe(v.vibe)} />
            ))}
          </OptionList>
          {errors.vibes ? (
            <Text variant="corpo-sm" tone="erro">
              {errors.vibes}
            </Text>
          ) : null}
        </View>

        <View className="gap-3">
          <SectionTitle title="Vende bebida alcoólica?" />
          <Segmented
            options={ALCOHOL}
            value={alcohol}
            onChange={(v) => {
              setAlcohol(v);
              setErrors((e) => ({ ...e, alcohol: undefined }));
            }}
          />
          {errors.alcohol ? (
            <Text variant="corpo-sm" tone="erro">
              {errors.alcohol}
            </Text>
          ) : null}
        </View>
      </View>
    </Screen>
  );
}

export default function RecommendSetupScreen() {
  const { data: place, isLoading, isError, refetch } = useMyPlace();

  if (place) return <SetupForm place={place} />;
  return (
    <Screen safeBottom={false}>
      {isLoading ? (
        <View className="gap-4 pt-2">
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-24 w-full" />
        </View>
      ) : isError ? (
        <ErrorState message="Não foi possível carregar os dados do seu lugar." actionLabel="Tentar novamente" onAction={() => refetch()} />
      ) : null}
    </Screen>
  );
}
