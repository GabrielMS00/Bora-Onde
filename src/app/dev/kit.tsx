import { Link } from 'expo-router';
import {
  BeerStein,
  BookmarkSimple,
  CaretDown,
  CaretLeft,
  CaretRight,
  CheckCircle,
  Check,
  Clock,
  Coffee,
  EnvelopeSimple,
  Eye,
  ForkKnife,
  Heart,
  House,
  Image as ImageIcon,
  Info,
  LockSimple,
  MagnifyingGlass,
  MapPin,
  NavigationArrow,
  Plus,
  ShareNetwork,
  SlidersHorizontal,
  Sparkle,
  Storefront,
  Trash,
  User,
  WarningCircle,
  Wine,
  X,
  type Icon,
} from 'phosphor-react-native';
import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo } from '@/components/ui/Logo';
import { Text } from '@/components/ui/Text';
import { colors, radius, shadows, space, type ColorToken } from '@/theme/tokens';
import type { TextVariant } from '@/theme/typography';

const colorGroups: { title: string; tokens: ColorToken[] }[] = [
  { title: 'Marca (só no logotipo)', tokens: ['marca'] },
  { title: 'Neutros', tokens: ['fundo', 'superficie', 'superficie-alt', 'linha', 'linha-controle'] },
  { title: 'Texto', tokens: ['texto', 'texto-secundario'] },
  { title: 'Acento (Meia-Noite)', tokens: ['acento', 'acento-pressionado', 'acento-suave'] },
  {
    title: 'Estados',
    tokens: ['sucesso', 'sucesso-suave', 'alerta', 'alerta-suave', 'erro', 'erro-suave', 'sobreposicao'],
  },
];

const typeSamples: [TextVariant, string][] = [
  ['display', 'Qual é a vibe de hoje?'],
  ['h1', 'Perto de você'],
  ['h2', 'Bar do Zé'],
  ['h3', 'Dados pessoais'],
  ['corpo', 'Drinques autorais, balcão iluminado e petiscos pra dividir.'],
  ['corpo-sm', 'Rua Maria Monteiro, 820 · Cambuí'],
  ['botao', 'Descobrir Bora Onde'],
  ['rotulo', 'E-mail'],
  ['rotulo-forte', 'Indicação'],
  ['tag', '#ComAmigos'],
  ['legenda', 'Legenda de apoio'],
  ['aba', 'Perfil'],
];

const icons: [string, Icon][] = [
  ['house', House],
  ['sparkle', Sparkle],
  ['user', User],
  ['storefront', Storefront],
  ['map-pin', MapPin],
  ['caret-down', CaretDown],
  ['caret-left', CaretLeft],
  ['caret-right', CaretRight],
  ['magnifying-glass', MagnifyingGlass],
  ['sliders-horizontal', SlidersHorizontal],
  ['clock', Clock],
  ['check', Check],
  ['check-circle', CheckCircle],
  ['x', X],
  ['warning-circle', WarningCircle],
  ['info', Info],
  ['trash', Trash],
  ['coffee', Coffee],
  ['wine', Wine],
  ['fork-knife', ForkKnife],
  ['beer-stein', BeerStein],
  ['navigation-arrow', NavigationArrow],
  ['envelope-simple', EnvelopeSimple],
  ['lock-simple', LockSimple],
  ['eye', Eye],
  ['heart', Heart],
  ['bookmark-simple', BookmarkSimple],
  ['plus', Plus],
  ['image', ImageIcon],
  ['share-network', ShareNetwork],
];

const filledIcons: [string, Icon][] = [
  ['house-fill', House],
  ['sparkle-fill', Sparkle],
  ['user-fill', User],
  ['storefront-fill', Storefront],
  ['bookmark-simple-fill', BookmarkSimple],
];

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <View className="gap-4 rounded-xl border border-linha bg-superficie p-8">
      <View className="gap-1">
        <Text variant="h2">{title}</Text>
        {note ? (
          <Text variant="corpo-sm" tone="secundario">
            {note}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

export default function UiKit() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-fundo"
      contentContainerClassName="gap-6 px-5"
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }}>
      <View className="gap-1">
        <Link href="/">
          <Text variant="rotulo-forte" tone="secundario">
            ← Voltar
          </Text>
        </Link>
        <Text variant="h1">UI Kit · Fase 1</Text>
        <Text variant="corpo-sm" tone="secundario">
          Tokens do Figma aplicados via NativeWind. Rota de desenvolvimento.
        </Text>
      </View>

      <Section
        title="Fundamentos · Cores"
        note="Regra 60-30-10: 60% neutros, 30% Meia-Noite em texto e estrutura, 10% Meia-Noite preenchido em ações. Vermelho Bora só no logotipo.">
        {colorGroups.map((group) => (
          <View key={group.title} className="gap-2">
            <Text variant="rotulo-forte" tone="secundario">
              {group.title}
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {group.tokens.map((token) => (
                <View key={token} style={{ width: '47%' }} className="gap-1">
                  <View
                    className="h-14 rounded-md border border-linha"
                    style={{ backgroundColor: colors[token] }}
                  />
                  <Text variant="rotulo">{token}</Text>
                  <Text variant="legenda" tone="secundario">
                    {colors[token]}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </Section>

      <Section
        title="Fundamentos · Tipografia"
        note="Plus Jakarta Sans (títulos) e DM Sans (interface). Tamanhos em px = sp/dp no React Native.">
        {typeSamples.map(([variant, sample]) => (
          <View key={variant} className="gap-1">
            <Text variant="legenda" tone="secundario">
              {variant}
            </Text>
            <Text variant={variant}>{sample}</Text>
          </View>
        ))}
      </Section>

      <Section
        title="Fundamentos · Espaço, raios e elevação"
        note="Base de 4 px. Margem lateral 20 px, padding de card 16 px, entre cards 24 px. Bordas antes de sombras: sombra-2 só no que flutua.">
        <View className="gap-2">
          {Object.entries(space).map(([key, value]) => (
            <View key={key} className="flex-row items-center gap-4">
              <Text variant="legenda" tone="secundario" className="w-[104px]">
                espaco/{key} · {value}
              </Text>
              <View className="h-4 rounded-sm bg-acento" style={{ width: value }} />
            </View>
          ))}
        </View>
        <View className="flex-row flex-wrap gap-4">
          {Object.entries(radius).map(([key, value]) => (
            <View key={key} className="items-center gap-1">
              <View
                className="h-16 w-16 border border-linha-controle bg-superficie-alt"
                style={{ borderRadius: value }}
              />
              <Text variant="legenda" tone="secundario">
                raio/{key}
              </Text>
            </View>
          ))}
        </View>
        <View className="gap-4 rounded-lg bg-fundo p-4">
          {(['sombra-1', 'sombra-2', 'anel-foco'] as const).map((key) => (
            <View
              key={key}
              className="h-14 items-center justify-center rounded-md bg-superficie"
              style={{ boxShadow: shadows[key] }}>
              <Text variant="rotulo">{key}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section
        title="Ícones (Phosphor)"
        note="Regular por padrão (traço 1,5 px a 24 px); Fill só no estado ativo da barra de abas e em ações ligadas.">
        <View className="flex-row flex-wrap gap-4">
          {icons.map(([name, IconComponent]) => (
            <View key={name} className="w-[30%] items-center gap-1">
              <IconComponent size={24} weight="regular" color={colors.texto} />
              <Text variant="legenda" tone="secundario" className="text-center">
                {name}
              </Text>
            </View>
          ))}
          {filledIcons.map(([name, IconComponent]) => (
            <View key={name} className="w-[30%] items-center gap-1">
              <IconComponent size={24} weight="fill" color={colors.texto} />
              <Text variant="legenda" tone="secundario" className="text-center">
                {name}
              </Text>
            </View>
          ))}
        </View>
      </Section>

      <Section
        title="Marca · Logotipo"
        note="Símbolo em Vermelho Bora, logotipo em Meia-Noite. Horizontal no cabeçalho do feed (mín. 20 px de altura), empilhado no login (mín. 56 px).">
        <View className="items-center justify-center rounded-lg border border-linha bg-fundo py-8">
          <Logo variant="horizontal" height={28} />
        </View>
        <View className="items-center justify-center rounded-lg bg-acento py-8">
          <Logo variant="horizontal-negativo" height={28} />
        </View>
        <View className="items-center justify-center rounded-lg border border-linha bg-fundo py-8">
          <Logo variant="empilhado" height={104} />
        </View>
        <View className="items-center justify-center rounded-lg border border-linha bg-fundo py-8">
          <Logo variant="simbolo" height={40} />
        </View>
      </Section>
    </ScrollView>
  );
}
