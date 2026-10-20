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
import type { Atmosphere, Place, PlaceType, Specialty, Vibe } from '@/data/types';
import { useMyPlace } from '@/features/establishment/useMyPlace';
import { ATMOSPHERES, VIBES, atmosphereLabel, specialtiesByType, specialtyLabel, vibeLabel } from '@/lib/place';

const TYPES: { type: PlaceType; label: string; icon: typeof Wine }[] = [
  { type: 'restaurant', label: 'Restaurante', icon: ForkKnife },
  { type: 'cafe', label: 'Cafeteria', icon: Coffee },
  { type: 'bar', label: 'Bar', icon: Wine },
];
const ALCOHOL = [
  { value: 'yes', label: 'Sim' },
  { value: 'no', label: 'Não' },
] as const;
const MAX_SPECIALTIES = 2;

type Alcohol = (typeof ALCOHOL)[number]['value'];
type Errors = { type?: string; specialties?: string; vibes?: string; alcohol?: string };

const toggle = <T,>(list: T[], item: T) => (list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);

function FieldError({ message }: { message?: string }) {
  return message ? (
    <Text variant="corpo-sm" tone="erro">
      {message}
    </Text>
  ) : null;
}

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
  const [specialties, setSpecialties] = useState<Specialty[]>(meta?.specialties ?? []);
  const [vibes, setVibes] = useState<Vibe[]>(meta?.vibes ?? []);
  const [atmospheres, setAtmospheres] = useState<Atmosphere[]>(meta?.atmospheres ?? []);
  const [alcohol, setAlcohol] = useState<Alcohol | undefined>(meta?.sellsAlcohol === undefined ? undefined : meta.sellsAlcohol ? 'yes' : 'no');
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  const chooseType = (next: PlaceType) => {
    if (next !== type) setSpecialties([]);
    setType(next);
    setErrors((e) => ({ ...e, type: undefined, specialties: undefined }));
  };

  const toggleSpecialty = (specialty: Specialty) => {
    if (!specialties.includes(specialty) && specialties.length >= MAX_SPECIALTIES) {
      setErrors((e) => ({ ...e, specialties: `Marque no máximo ${MAX_SPECIALTIES} especialidades.` }));
      return;
    }
    setSpecialties((cur) => toggle(cur, specialty));
    setErrors((e) => ({ ...e, specialties: undefined }));
  };

  const toggleVibe = (vibe: Vibe) => {
    setVibes((cur) => toggle(cur, vibe));
    setErrors((e) => ({ ...e, vibes: undefined }));
  };

  const save = async () => {
    const next: Errors = {
      type: type ? undefined : 'Escolha o tipo de estabelecimento.',
      vibes: vibes.length > 0 ? undefined : 'Marque ao menos uma companhia.',
      alcohol: alcohol ? undefined : 'Informe se vende bebida alcoólica.',
    };
    setErrors(next);
    if (next.type || next.vibes || next.alcohol || !type || !alcohol) return;

    setSaving(true);
    try {
      await saveMetadata(place.id, { type, specialties, vibes, atmospheres, sellsAlcohol: alcohol === 'yes' });
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
                onPress={() => chooseType(t.type)}
              />
            ))}
          </View>
          <FieldError message={errors.type} />
        </View>

        {type ? (
          <View className="gap-3">
            <SectionTitle title="Especialidade" hint={`Até ${MAX_SPECIALTIES} · opcional`} />
            <OptionList>
              {specialtiesByType[type].map((s) => (
                <ListOption key={s} label={specialtyLabel[s]} selected={specialties.includes(s)} onPress={() => toggleSpecialty(s)} />
              ))}
            </OptionList>
            <FieldError message={errors.specialties} />
          </View>
        ) : null}

        <View className="gap-3">
          <SectionTitle title="Companhia" hint="Para quem o lugar combina · marque todas que se aplicam" />
          <OptionList>
            {VIBES.map((v) => (
              <ListOption key={v} label={vibeLabel[v]} selected={vibes.includes(v)} onPress={() => toggleVibe(v)} />
            ))}
          </OptionList>
          <FieldError message={errors.vibes} />
        </View>

        <View className="gap-3">
          <SectionTitle title="Clima" hint="Marque todos que se aplicam · opcional" />
          <OptionList>
            {ATMOSPHERES.map((a) => (
              <ListOption key={a} label={atmosphereLabel[a]} selected={atmospheres.includes(a)} onPress={() => setAtmospheres((cur) => toggle(cur, a))} />
            ))}
          </OptionList>
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
          <FieldError message={errors.alcohol} />
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
