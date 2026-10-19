import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { CityField } from '@/components/ui/CityField';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { useToast } from '@/components/ui/Toast';
import { AuthFailure, registerEstablishment } from '@/features/auth/authApi';
import { useSession } from '@/features/auth/session';
import { PhotoManager, type PhotoItem } from '@/features/establishment/PhotoManager';
import { signupEstablishmentSchema, type SignupEstablishmentForm } from '@/features/establishment/schemas';
import { formatCep } from '@/lib/place';

// 1.4 Cadastro de estabelecimento. Ao concluir a sessão muda e o guard leva ao feed da região.
export default function SignupEstablishmentScreen() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { withSessionHeld } = useSession();
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [photosError, setPhotosError] = useState<string>();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignupEstablishmentForm>({
    resolver: zodResolver(signupEstablishmentSchema),
    defaultValues: { name: '', cep: '', city: '', neighborhood: '', street: '', number: '', email: '', password: '' },
  });

  const submit = handleSubmit(async (form) => {
    if (photos.length === 0) {
      setPhotosError('Adicione ao menos uma foto do local.');
      return;
    }
    setPhotosError(undefined);
    try {
      // A sessão fica retida até as fotos subirem: o formulário continua na tela (botão em carregamento) e o
      // feed já abre com o lugar completo.
      const { photosFailed } = await withSessionHeld(async () => {
        const result = await registerEstablishment(form, photos);
        await queryClient.invalidateQueries({ queryKey: ['places'] });
        return result;
      });
      if (photosFailed) {
        toast.show('error', 'Conta criada, mas não foi possível enviar as fotos. Adicione-as em Perfil do local.');
      }
    } catch (e) {
      toast.show('error', e instanceof AuthFailure ? e.message : 'Não foi possível cadastrar o estabelecimento. Tente novamente.');
    }
  });

  return (
    <Screen
      header={<ScreenHeader title="Cadastro do local" />}
      footer={<Button label="Cadastrar estabelecimento" onPress={submit} loading={isSubmitting} />}>
      <View className="pb-4 pt-2">
        <Text variant="h1">Cadastre seu estabelecimento</Text>
      </View>

      <View className="gap-4">
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <TextField label="Nome do estabelecimento" placeholder="Ex.: Bar do Zé" autoCapitalize="words" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
          )}
        />

        <View className="gap-2">
          <Text variant="rotulo">Fotos do local</Text>
          <PhotoManager
            addFirst
            items={photos}
            onChange={(items) => {
              setPhotos(items);
              if (items.length > 0) setPhotosError(undefined);
            }}
          />
          {photosError ? (
            <Text variant="corpo-sm" tone="erro">
              {photosError}
            </Text>
          ) : (
            <Text variant="legenda" tone="secundario">
              Até 10 fotos. A primeira vira a capa no feed.
            </Text>
          )}
        </View>

        <Controller
          control={control}
          name="cep"
          render={({ field, fieldState }) => (
            <TextField label="CEP" placeholder="00000-000" keyboardType="number-pad" maxLength={9} autoComplete="postal-code" value={formatCep(field.value)} onChangeText={(v) => field.onChange(v.replace(/\D/g, '').slice(0, 8))} onBlur={field.onBlur} error={fieldState.error?.message} />
          )}
        />
        <Controller
          control={control}
          name="city"
          render={({ field, fieldState }) => <CityField value={field.value} onChange={field.onChange} error={fieldState.error?.message} />}
        />
        <Controller
          control={control}
          name="neighborhood"
          render={({ field, fieldState }) => (
            <TextField label="Bairro" placeholder="Ex.: Asa Sul" autoCapitalize="words" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
          )}
        />
        <View className="flex-row items-start gap-3">
          <View className="flex-1">
            <Controller
              control={control}
              name="street"
              render={({ field, fieldState }) => (
                <TextField label="Rua" placeholder="Nome da rua" autoCapitalize="words" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
              )}
            />
          </View>
          <View className="w-[96px]">
            <Controller
              control={control}
              name="number"
              render={({ field, fieldState }) => (
                <TextField label="Número" placeholder="Nº" maxLength={10} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
              )}
            />
          </View>
        </View>
        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <TextField label="E-mail comercial" placeholder="contato@seulocal.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field, fieldState }) => (
            <TextField label="Senha" password placeholder="Crie uma senha" hint="Mínimo de 8 caracteres" autoComplete="new-password" textContentType="newPassword" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
          )}
        />
      </View>
    </Screen>
  );
}
