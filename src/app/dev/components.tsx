import { Coffee, ForkKnife, Heart, MagnifyingGlass, Plus, Wine } from 'phosphor-react-native';
import { useState, type ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Badge, InfoBox } from '@/components/ui/Notices';
import { AddPhotoTile, PhotoFrame, PhotoThumb } from '@/components/ui/Photo';
import { PlaceCard } from '@/components/ui/PlaceCard';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SelectField } from '@/components/ui/SelectField';
import { ListOption, OptionBlock, OptionList, Segmented } from '@/components/ui/Selectors';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/StateView';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { useToast } from '@/components/ui/Toast';
import type { Place } from '@/data/types';

const swatch = (color: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500"><rect width="400" height="500" fill="${color}"/></svg>`)}`;

const samplePlace: Place = {
  id: 'demo',
  name: 'Bar do Zé',
  photos: [swatch('#D9CFC1'), swatch('#C9BFAF'), swatch('#B9AE9C')],
  cep: '70239510',
  city: 'Brasília, DF',
  neighborhood: 'Asa Sul',
  street: 'CLS 405',
  number: 'Loja 12',
  metadata: { type: 'bar', vibes: ['friends'], sellsAlcohol: true },
};

const cities = ['Brasília, DF', 'São Paulo, SP', 'Belo Horizonte, MG'];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-4 rounded-xl border border-linha bg-superficie p-5">
      <Text variant="h2">{title}</Text>
      {children}
    </View>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View className="gap-2">
      <Text variant="legenda" tone="secundario">
        {label}
      </Text>
      {children}
    </View>
  );
}

export default function ComponentsGallery() {
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const [type, setType] = useState<'restaurant' | 'cafe' | 'bar'>('bar');
  const [vibes, setVibes] = useState<string[]>(['friends']);
  const [alcohol, setAlcohol] = useState<'yes' | 'no'>('yes');
  const [filter, setFilter] = useState('Todos');
  const [quiz, setQuiz] = useState('Bar');
  const [city, setCity] = useState<string | undefined>('Brasília, DF');
  const [sheet, setSheet] = useState(false);
  const [modal, setModal] = useState<'none' | 'destrutivo' | 'sucesso'>('none');
  const [email, setEmail] = useState('');

  const toggleVibe = (v: string) => setVibes((cur) => (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]));

  return (
    <View className="flex-1 bg-fundo" style={{ paddingTop: insets.top }}>
      <ScreenHeader title="Componentes (dev)" />
      <ScrollView contentContainerClassName="gap-6 px-5" contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <Section title="Botão">
          {(['primario', 'secundario', 'contorno', 'fantasma', 'destrutivo', 'destrutivo-suave'] as const).map((variant) => (
            <Row key={variant} label={variant}>
              <Button label="Rótulo" variant={variant} />
              <View className="flex-row gap-3">
                <Button label="Médio" variant={variant} size="medio" fullWidth={false} />
                <Button label="Ícone" variant={variant} size="medio" icon={Plus} fullWidth={false} />
                <Button label="Off" variant={variant} size="medio" disabled fullWidth={false} />
              </View>
            </Row>
          ))}
          <Row label="carregando">
            <Button label="Entrar" loading />
          </Row>
        </Section>

        <Section title="Campo de texto">
          <TextField label="E-mail" placeholder="voce@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <TextField label="Preenchido" value="Ana Souza" onChangeText={() => {}} />
          <TextField label="E-mail" value="ana@" onChangeText={() => {}} error="Informe um e-mail válido." />
          <TextField label="Senha" password placeholder="Mínimo de 8 caracteres" />
          <TextField label="Buscar" leftIcon={MagnifyingGlass} placeholder="Buscar lugares" />
          <SelectField label="Cidade" value={city} onPress={() => setSheet(true)} />
          <SelectField label="Cidade" placeholder="Selecione sua cidade" error="Escolha uma cidade." onPress={() => setSheet(true)} />
        </Section>

        <Section title="Chip">
          <Row label="filtro (36 px)">
            <View className="flex-row flex-wrap gap-2">
              {[
                ['Todos', undefined],
                ['Restaurante', ForkKnife],
                ['Cafeteria', Coffee],
                ['Bar', Wine],
              ].map(([label, icon]) => (
                <Chip key={label as string} label={label as string} icon={icon as never} selected={filter === label} onPress={() => setFilter(label as string)} />
              ))}
              <Chip label="Ambiente" dropdown />
              <Chip label="Com álcool" />
            </View>
          </Row>
          <Row label="indicação (48 px)">
            <View className="flex-row flex-wrap gap-2">
              {[
                ['Restaurante', ForkKnife],
                ['Cafeteria', Coffee],
                ['Bar', Wine],
                ['Tanto faz', undefined],
              ].map(([label, icon]) => (
                <Chip key={label as string} variant="indicacao" label={label as string} icon={icon as never} selected={quiz === label} onPress={() => setQuiz(label as string)} />
              ))}
              <Chip variant="indicacao" label="Encontro romântico" icon={Heart} />
            </View>
          </Row>
          <Row label="tag (24 px)">
            <View className="flex-row flex-wrap gap-2">
              <Chip variant="tag" label="Bar" icon={Wine} />
              <Chip variant="tag" label="#ComAmigos" />
              <Chip variant="tag" label="#ComÁlcool" />
            </View>
          </Row>
        </Section>

        <Section title="Seletores">
          <Row label="opção em bloco">
            <View className="flex-row gap-2">
              <OptionBlock label="Restaurante" icon={ForkKnife} selected={type === 'restaurant'} onPress={() => setType('restaurant')} />
              <OptionBlock label="Cafeteria" icon={Coffee} selected={type === 'cafe'} onPress={() => setType('cafe')} />
              <OptionBlock label="Bar" icon={Wine} selected={type === 'bar'} onPress={() => setType('bar')} />
            </View>
          </Row>
          <Row label="segmento">
            <Segmented
              value={alcohol}
              onChange={setAlcohol}
              options={[
                { value: 'yes', label: 'Sim' },
                { value: 'no', label: 'Não' },
              ]}
            />
          </Row>
          <Row label="opção de lista (checkbox)">
            <OptionList>
              <ListOption label="Familiar" selected={vibes.includes('family')} onPress={() => toggleVibe('family')} />
              <ListOption label="Amigos" selected={vibes.includes('friends')} onPress={() => toggleVibe('friends')} />
              <ListOption label="Encontros românticos" selected={vibes.includes('romantic')} onPress={() => toggleVibe('romantic')} />
            </OptionList>
          </Row>
          <Row label="opção de lista (rádio)">
            <OptionList>
              <ListOption type="radio" label="Opção A" selected />
              <ListOption type="radio" label="Opção B" />
            </OptionList>
          </Row>
        </Section>

        <Section title="Foto">
          <Row label="4:5 · 3:2 · 1:1 (placeholder)">
            <View className="gap-3">
              <PhotoFrame ratio="4:5" className="rounded-md" />
              <PhotoFrame ratio="3:2" className="rounded-md" />
            </View>
          </Row>
          <Row label="miniaturas e adicionar">
            <View className="flex-row gap-3">
              <AddPhotoTile onPress={() => toast.show('success', 'Seletor de imagens: Fase 4.')} />
              <PhotoThumb uri={swatch('#D9CFC1')} onRemove={() => toast.show('success', 'Foto removida.')} />
              <PhotoThumb onRemove={() => {}} />
            </View>
          </Row>
        </Section>

        <Section title="Card do lugar">
          <Row label="feed (4:5, carrossel com 3 fotos)">
            <PlaceCard place={samplePlace} />
          </Row>
          <Row label="destaque (3:2, sombra-2)">
            <PlaceCard place={samplePlace} variant="destaque" caption="Combina com o que você pediu" />
          </Row>
          <Row label="sem fotos nem Dados Extras">
            <PlaceCard place={{ ...samplePlace, id: 'x', name: 'Café Novo', photos: [], metadata: undefined }} />
          </Row>
        </Section>

        <Section title="Selo, aviso e estados">
          <Badge label="Match ideal pra hoje" />
          <InfoBox>Estes dados decidem quando o Bar do Zé é indicado no questionário dos usuários.</InfoBox>
          <Row label="aviso (toast, some em 4 s)">
            <View className="flex-row gap-3">
              <Button label="Sucesso" variant="secundario" size="medio" fullWidth={false} onPress={() => toast.show('success', 'Alterações salvas. Seu feed agora mostra os lugares de São Paulo.')} />
              <Button label="Erro" variant="secundario" size="medio" fullWidth={false} onPress={() => toast.show('error', 'Não foi possível salvar. Tente novamente.')} />
            </View>
          </Row>
          <Row label="modal de confirmação">
            <View className="flex-row gap-3">
              <Button label="Destrutivo" variant="destrutivo-suave" size="medio" fullWidth={false} onPress={() => setModal('destrutivo')} />
              <Button label="Sucesso" variant="secundario" size="medio" fullWidth={false} onPress={() => setModal('sucesso')} />
            </View>
          </Row>
          <Row label="estado vazio / erro / carregando">
            <EmptyState title="Nenhum lugar encontrado" message="Nenhum lugar com esses critérios em Brasília." actionLabel="Limpar filtros" onAction={() => {}} />
            <ErrorState message="Não foi possível carregar os lugares." actionLabel="Tentar novamente" onAction={() => {}} />
            <View className="gap-2">
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </View>
          </Row>
        </Section>
      </ScrollView>

      <BottomSheet visible={sheet} title="Cidade" onClose={() => setSheet(false)}>
        <OptionList>
          {cities.map((c) => (
            <ListOption
              key={c}
              type="radio"
              label={c}
              selected={city === c}
              onPress={() => {
                setCity(c);
                setSheet(false);
              }}
            />
          ))}
        </OptionList>
      </BottomSheet>

      <ConfirmModal
        visible={modal === 'destrutivo'}
        title="Tem certeza que deseja excluir sua conta?"
        message="Seus dados serão apagados e a conta não poderá ser recuperada."
        confirmLabel="Excluir conta"
        onConfirm={() => setModal('none')}
        onCancel={() => setModal('none')}
      />
      <ConfirmModal
        visible={modal === 'sucesso'}
        type="sucesso"
        title="Link enviado!"
        message="Enviamos as instruções para voce@email.com. Confira também a caixa de spam."
        confirmLabel="Voltar para o login"
        onConfirm={() => setModal('none')}
      />
    </View>
  );
}
