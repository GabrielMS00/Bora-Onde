import { router } from 'expo-router';
import { Coffee, ForkKnife, Heart, Sparkle, Wine, type Icon } from 'phosphor-react-native';
import { useState, type ReactNode } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import type { QuizAnswers } from '@/features/recommendation/engine';
import { colors } from '@/theme/tokens';

// 2.2 Questionário de indicação: 3 perguntas rápidas → resultado (2.3). Fundo "Pedra", chips de Indicação (48 px).

type Option<T extends string> = { value: T; label: string; icon?: Icon };

const TYPE_OPTIONS: Option<QuizAnswers['type']>[] = [
  { value: 'restaurant', label: 'Restaurante', icon: ForkKnife },
  { value: 'cafe', label: 'Cafeteria', icon: Coffee },
  { value: 'bar', label: 'Bar', icon: Wine },
  { value: 'any', label: 'Tanto faz' },
];
const VIBE_OPTIONS: Option<QuizAnswers['vibe']>[] = [
  { value: 'family', label: 'Familiar' },
  { value: 'friends', label: 'Com amigos' },
  { value: 'romantic', label: 'Encontro romântico', icon: Heart },
];
const ALCOHOL_OPTIONS: Option<QuizAnswers['alcohol']>[] = [
  { value: 'yes', label: 'Sim' },
  { value: 'any', label: 'Não / Tanto faz' },
];

function Question({ number, title, children }: { number: number; title: string; children: ReactNode }) {
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
    </View>
  );
}

// Tocar de novo na opção marcada desmarca a resposta (volta a `undefined`).
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
  const [vibe, setVibe] = useState<QuizAnswers['vibe']>();
  const [alcohol, setAlcohol] = useState<QuizAnswers['alcohol']>();

  const answered = [type, vibe, alcohol].filter(Boolean).length;
  const ready = type !== undefined && vibe !== undefined && alcohol !== undefined;

  const discover = () => {
    if (!ready) return;
    router.push({ pathname: '/recommend/result', params: { type, vibe, alcohol } });
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
            {answered} de 3 respondidas
          </Text>
        </View>
        <View className="flex-row gap-1" accessibilityElementsHidden>
          {[0, 1, 2].map((i) => (
            <View key={i} className={`h-1 flex-1 rounded-pilula ${i < answered ? 'bg-acento' : 'bg-linha-controle opacity-40'}`} />
          ))}
        </View>
      </View>

      <View className="gap-8">
        <View className="gap-2">
          <Text variant="h1">Bora decidir?</Text>
          <Text variant="corpo" tone="secundario">
            Responda 3 perguntas rápidas e a gente indica um lugar pra você.
          </Text>
        </View>

        <Question number={1} title="Qual tipo de lugar você procura hoje?">
          <Options options={TYPE_OPTIONS} value={type} onChange={setType} />
        </Question>
        <Question number={2} title="Qual é a vibe ou companhia do rolê?">
          <Options options={VIBE_OPTIONS} value={vibe} onChange={setVibe} />
        </Question>
        <Question number={3} title="Precisa vender bebida alcoólica?">
          <Options options={ALCOHOL_OPTIONS} value={alcohol} onChange={setAlcohol} />
        </Question>
      </View>
    </Screen>
  );
}
