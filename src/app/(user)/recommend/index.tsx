import { router } from 'expo-router';
import { Coffee, ForkKnife, Heart, Sparkle, Wine, type Icon } from 'phosphor-react-native';
import { useState, type ReactNode } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import type { PlaceType, Vibe } from '@/data/types';
import type { QuizAnswers } from '@/features/recommendation/engine';
import { ATMOSPHERES, VIBES, atmosphereLabel, specialtiesByType, specialtyLabel, specialtyQuestion, vibeLabel } from '@/lib/place';
import { colors } from '@/theme/tokens';

type Option<T extends string> = { value: T; label: string; icon?: Icon };

const ANY = { value: 'any', label: 'Tanto faz' } as const;

const TYPE_OPTIONS: Option<QuizAnswers['type']>[] = [
  { value: 'restaurant', label: 'Restaurante', icon: ForkKnife },
  { value: 'cafe', label: 'Cafeteria', icon: Coffee },
  { value: 'bar', label: 'Bar', icon: Wine },
  ANY,
];
const VIBE_OPTIONS: Option<Vibe>[] = VIBES.map((v) => ({ value: v, label: vibeLabel[v], icon: v === 'romantic' ? Heart : undefined }));
const ATMOSPHERE_OPTIONS: Option<QuizAnswers['atmosphere']>[] = [...ATMOSPHERES.map((a) => ({ value: a, label: atmosphereLabel[a] })), ANY];
const ALCOHOL_OPTIONS: Option<QuizAnswers['alcohol']>[] = [
  { value: 'yes', label: 'Sim' },
  { value: 'any', label: 'Não / Tanto faz' },
];

const specialtyOptions = (type: PlaceType): Option<QuizAnswers['specialty']>[] => [
  ...specialtiesByType[type].map((s) => ({ value: s, label: specialtyLabel[s] })),
  ANY,
];

function Question({ number, title, children, extra }: { number: number; title: string; children: ReactNode; extra?: ReactNode }) {
  return (
    <View className="gap-4">
      <View className="flex-row items-start gap-3">
        <View className="h-7 w-7 items-center justify-center rounded-pilula border-[1.5px] border-texto">
          <Text variant="rotulo-forte">{number}</Text>
        </View>
        <Text variant="h2" className="flex-1">
          {title}
        </Text>
      </View>
      <View className="flex-row flex-wrap gap-2">{children}</View>
      {extra}
    </View>
  );
}

function Options<T extends string>({ options, value, onChange }: { options: Option<T>[]; value: T | undefined; onChange: (v: T | undefined) => void }) {
  return options.map((o) => (
    <Chip
      key={o.value}
      variant="indicacao"
      label={o.label}
      icon={o.icon}
      selected={value === o.value}
      onPress={() => onChange(value === o.value ? undefined : o.value)}
    />
  ));
}

export default function RecommendQuizScreen() {
  const [type, setType] = useState<QuizAnswers['type']>();
  const [specialty, setSpecialty] = useState<QuizAnswers['specialty']>();
  const [vibe, setVibe] = useState<Vibe>();
  const [atmosphere, setAtmosphere] = useState<QuizAnswers['atmosphere']>();
  const [alcohol, setAlcohol] = useState<QuizAnswers['alcohol']>();

  const subType = type && type !== 'any' ? type : undefined;
  const steps = subType ? [type, specialty, vibe, atmosphere, alcohol] : [type, vibe, atmosphere, alcohol];
  const answered = steps.filter((s) => s !== undefined).length;
  const ready = answered === steps.length;

  const chooseType = (next: QuizAnswers['type'] | undefined) => {
    setType(next);
    setSpecialty(undefined);
  };

  const discover = () => {
    if (!ready) return;
    router.push({ pathname: '/recommend/result', params: { type, specialty: subType ? specialty : 'any', vibe, atmosphere, alcohol } });
  };

  return (
    <Screen
      background="pedra"
      safeBottom={false}
      footer={<Button label="Descobrir Bora Onde" icon={Sparkle} onPress={discover} disabled={!ready} />}>
      <View className="gap-3 pb-6 pt-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1">
            <Sparkle size={16} weight="fill" color={colors.texto} />
            <Text variant="rotulo-forte">Indicação</Text>
          </View>
          <Text variant="corpo-sm" tone="secundario" accessibilityLiveRegion="polite">
            {answered} de {steps.length} respondidas
          </Text>
        </View>
        <View className="flex-row gap-1" accessibilityElementsHidden>
          {steps.map((_, i) => (
            <View key={i} className={`h-1 flex-1 rounded-pilula ${i < answered ? 'bg-acento' : 'bg-linha-controle opacity-40'}`} />
          ))}
        </View>
      </View>

      <View className="gap-8">
        <View className="gap-2">
          <Text variant="h1">Bora decidir?</Text>
          <Text variant="corpo" tone="secundario">
            Responda algumas perguntas rápidas e a gente indica um lugar pra você.
          </Text>
        </View>

        <Question
          number={1}
          title="Qual tipo de lugar você procura hoje?"
          extra={
            subType ? (
              <View className="gap-3 rounded-lg border border-linha bg-superficie p-4">
                <Text variant="h3" accessibilityRole="header">
                  {specialtyQuestion[subType]}
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  <Options options={specialtyOptions(subType)} value={specialty} onChange={setSpecialty} />
                </View>
              </View>
            ) : null
          }>
          <Options options={TYPE_OPTIONS} value={type} onChange={chooseType} />
        </Question>
        <Question number={2} title="Com quem você vai?">
          <Options options={VIBE_OPTIONS} value={vibe} onChange={setVibe} />
        </Question>
        <Question number={3} title="Qual o clima do rolê?">
          <Options options={ATMOSPHERE_OPTIONS} value={atmosphere} onChange={setAtmosphere} />
        </Question>
        <Question number={4} title="Precisa vender bebida alcoólica?">
          <Options options={ALCOHOL_OPTIONS} value={alcohol} onChange={setAlcohol} />
        </Question>
      </View>
    </Screen>
  );
}
