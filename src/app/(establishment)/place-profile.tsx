import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { CityField } from '@/components/ui/CityField';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Screen } from '@/components/ui/Screen';
import { ErrorState, Skeleton } from '@/components/ui/StateView';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { useToast } from '@/components/ui/Toast';
import { deleteMyAccount, updateMyPlace } from '@/data/api/placesApi';
import { removePhotos, uploadPhoto } from '@/data/api/storageApi';
import { photoUrl } from '@/data/supabase';
import type { Place } from '@/data/types';
import { useSession } from '@/features/auth/session';
import { PhotoManager, type PhotoItem } from '@/features/establishment/PhotoManager';
import { placeFieldsSchema, type PlaceFieldsForm } from '@/features/establishment/schemas';
import { useMyPlace } from '@/features/establishment/useMyPlace';
import { formatCep } from '@/lib/place';

const toItems = (paths: string[]): PhotoItem[] => paths.map((path) => ({ key: path, uri: photoUrl(path), path }));

function ProfileForm({ place }: { place: Place }) {
  const { session, signOut } = useSession();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [photos, setPhotos] = useState<PhotoItem[]>(() => toItems(place.photos));
  const [photosError, setPhotosError] = useState<string>();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<PlaceFieldsForm>({
    resolver: zodResolver(placeFieldsSchema),
    defaultValues: {
      name: place.name,
      cep: place.cep,
      city: place.city,
      neighborhood: place.neighborhood,
      street: place.street,
      number: place.number,
    },
  });

  const save = handleSubmit(async (values) => {
    if (photos.length === 0) {
      setPhotosError('Mantenha ao menos uma foto do local.');
      return;
    }
    setPhotosError(undefined);
    const uid = session!.accountId;
    try {
      const finalPaths: string[] = [];
      for (const item of photos) {
        finalPaths.push(item.path ?? (await uploadPhoto(uid, { uri: item.uri, mimeType: item.mimeType })));
      }
      await updateMyPlace(place.id, { ...values, photos: finalPaths });
      await removePhotos(uid, place.photos.filter((p) => !finalPaths.includes(p)));

      setPhotos(toItems(finalPaths));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['my-place'] }),
        queryClient.invalidateQueries({ queryKey: ['places'] }),
      ]);
      toast.show('success', 'Alterações salvas. O feed já mostra os dados atualizados.');
    } catch {
      toast.show('error', 'Não foi possível salvar as alterações. Tente novamente.');
    }
  });

  const remove = async () => {
    setDeleting(true);
    try {
      await deleteMyAccount(session!.accountId);
      queryClient.invalidateQueries({ queryKey: ['places'] });
      toast.show('success', 'Conta excluída.');
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
      toast.show('error', 'Não foi possível excluir a conta. Tente novamente.');
    }
  };

  return (
    <Screen safeBottom={false}>
      <View className="gap-6 pt-2">
        <Text variant="h1">Perfil do local</Text>

        <View className="gap-3">
          <View className="flex-row flex-wrap items-baseline gap-2">
            <Text variant="h3" accessibilityRole="header">
              Fotos ({photos.length})
            </Text>
            <Text variant="legenda" tone="secundario">
              Toque no X para remover
            </Text>
          </View>
          <PhotoManager items={photos} onChange={(items) => { setPhotos(items); if (items.length > 0) setPhotosError(undefined); }} />
          {photosError ? (
            <Text variant="corpo-sm" tone="erro">
              {photosError}
            </Text>
          ) : (
            <Text variant="legenda" tone="secundario">
              A primeira foto vira a capa no feed. Até 10 fotos.
            </Text>
          )}
        </View>

        <View className="gap-4">
          <Text variant="h3" accessibilityRole="header">
            Dados do local
          </Text>
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }) => (
              <TextField label="Nome do estabelecimento" autoCapitalize="words" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
            )}
          />
          <Controller
            control={control}
            name="cep"
            render={({ field, fieldState }) => (
              <TextField label="CEP" keyboardType="number-pad" maxLength={9} value={formatCep(field.value)} onChangeText={(v) => field.onChange(v.replace(/\D/g, '').slice(0, 8))} onBlur={field.onBlur} error={fieldState.error?.message} />
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
              <TextField label="Bairro" autoCapitalize="words" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
            )}
          />
          <View className="flex-row items-start gap-3">
            <View className="flex-1">
              <Controller
                control={control}
                name="street"
                render={({ field, fieldState }) => (
                  <TextField label="Rua" autoCapitalize="words" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
                )}
              />
            </View>
            <View className="w-[96px]">
              <Controller
                control={control}
                name="number"
                render={({ field, fieldState }) => (
                  <TextField label="Número" maxLength={10} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
                )}
              />
            </View>
          </View>
        </View>

        <View className="gap-3">
          <Button label="Salvar alterações" onPress={save} loading={isSubmitting} />
          <Button label="Sair da conta" variant="fantasma" size="medio" onPress={() => signOut()} />
        </View>

        <View className="gap-3 border-t border-linha pt-5">
          <Text variant="rotulo-forte">Zona de perigo</Text>
          <Text variant="corpo-sm" tone="secundario">
            A exclusão é permanente e não pode ser desfeita.
          </Text>
          <Button label="Excluir conta do estabelecimento" variant="destrutivo-suave" onPress={() => setConfirmDelete(true)} />
        </View>
      </View>

      <ConfirmModal
        visible={confirmDelete}
        title="Excluir a conta do estabelecimento?"
        message={`Tem certeza que deseja excluir permanentemente o ${place.name}? O lugar sairá do feed e as fotos e os dados serão apagados.`}
        confirmLabel="Excluir conta"
        loading={deleting}
        onConfirm={remove}
        onCancel={() => !deleting && setConfirmDelete(false)}
      />
    </Screen>
  );
}

export default function PlaceProfileScreen() {
  const { data: place, isLoading, isError, refetch } = useMyPlace();

  if (place) return <ProfileForm place={place} />;
  return (
    <Screen safeBottom={false}>
      {isLoading ? (
        <View className="gap-4 pt-2">
          <Skeleton className="h-9 w-1/2" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-14 w-full" />
        </View>
      ) : isError ? (
        <ErrorState message="Não foi possível carregar o perfil do local." actionLabel="Tentar novamente" onAction={() => refetch()} />
      ) : null}
    </Screen>
  );
}
