import { useQueryClient } from '@tanstack/react-query';
import { LockSimple } from 'phosphor-react-native';
import { Fragment, useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { CityField } from '@/components/ui/CityField';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Screen } from '@/components/ui/Screen';
import { ErrorState, Skeleton } from '@/components/ui/StateView';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { deleteMyAccount } from '@/data/api/placesApi';
import { useSession } from '@/features/auth/session';
import { updateMyCity, type UserProfile } from '@/features/profile/profileApi';
import { useMyUser } from '@/features/profile/useMyUser';
import { colors } from '@/theme/tokens';

const genderLabel: Record<UserProfile['gender'], string> = { F: 'Feminino', M: 'Masculino', O: 'Outro' };

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? (parts.at(-1)?.[0] ?? '') : '')).toUpperCase();
}

function ProfileView({ user }: { user: UserProfile }) {
  const { session, signOut } = useSession();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [city, setCity] = useState(user.city);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await updateMyCity(user.id, city);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['my-user'] }),
        queryClient.invalidateQueries({ queryKey: ['places'] }),
      ]);
      toast.show('success', `Alterações salvas. Seu feed agora mostra os lugares de ${city.split(',')[0]}.`);
    } catch {
      toast.show('error', 'Não foi possível salvar as alterações. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await deleteMyAccount(user.id);
      toast.show('success', 'Conta excluída.');
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
      toast.show('error', 'Não foi possível excluir a conta. Tente novamente.');
    }
  };

  const rows: [string, string][] = [
    ['Nome', user.name],
    ['Idade', `${user.age} anos`],
    ['Sexo', genderLabel[user.gender]],
    ['E-mail', session?.email ?? ''],
  ];

  return (
    <Screen safeBottom={false}>
      <View className="gap-6 pt-2">
        <Text variant="h1">Meu perfil</Text>

        <View className="flex-row items-center gap-4">
          <View className="h-16 w-16 items-center justify-center rounded-pilula bg-superficie-alt">
            <Text variant="h2">{initials(user.name)}</Text>
          </View>
          <View className="flex-1 gap-[2px]">
            <Text variant="h2">{user.name}</Text>
            <Text variant="corpo-sm" tone="secundario">
              Usuário padrão · {user.city}
            </Text>
          </View>
        </View>

        <View className="gap-3">
          <View className="flex-row items-center gap-2">
            <Text variant="h3" accessibilityRole="header">
              Dados pessoais
            </Text>
            <View className="h-6 flex-row items-center gap-1 rounded-pilula bg-superficie-alt px-2">
              <LockSimple size={12} color={colors['texto-secundario']} />
              <Text variant="legenda" tone="secundario">
                Somente leitura
              </Text>
            </View>
          </View>
          <View className="overflow-hidden rounded-lg border border-linha">
            {rows.map(([label, value], i) => (
              <Fragment key={label}>
                {i > 0 ? <View className="h-px bg-linha" /> : null}
                <View className="min-h-[48px] flex-row items-center justify-between gap-4 px-4 py-3">
                  <Text variant="corpo-sm" tone="secundario">
                    {label}
                  </Text>
                  <Text variant="corpo-sm" className="shrink text-right">
                    {value}
                  </Text>
                </View>
              </Fragment>
            ))}
          </View>
        </View>

        <View className="gap-3">
          <Text variant="h3" accessibilityRole="header">
            Sua cidade
          </Text>
          <CityField value={city} onChange={setCity} />
          <Text variant="legenda" tone="secundario">
            A cidade define quais lugares aparecem no seu feed e nas indicações.
          </Text>
        </View>

        <View className="gap-3">
          <Button label="Salvar alterações" onPress={save} loading={saving} disabled={city === user.city} />
          <Button label="Sair da conta" variant="contorno" onPress={() => signOut()} />
        </View>

        <View className="gap-3 border-t border-linha pt-5">
          <Text variant="rotulo-forte">Zona de perigo</Text>
          <Text variant="corpo-sm" tone="secundario">
            A exclusão é permanente e não pode ser desfeita.
          </Text>
          <Button label="Excluir minha conta" variant="destrutivo-suave" onPress={() => setConfirmDelete(true)} />
        </View>
      </View>

      <ConfirmModal
        visible={confirmDelete}
        title="Tem certeza que deseja excluir sua conta?"
        message="Seus dados serão apagados e a conta não poderá ser recuperada."
        confirmLabel="Excluir conta"
        loading={deleting}
        onConfirm={remove}
        onCancel={() => !deleting && setConfirmDelete(false)}
      />
    </Screen>
  );
}

export default function UserProfileScreen() {
  const { data: user, isLoading, isError, refetch } = useMyUser();

  if (user) return <ProfileView user={user} />;
  return (
    <Screen safeBottom={false}>
      {isLoading ? (
        <View className="gap-4 pt-2">
          <Skeleton className="h-9 w-1/2" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-48 w-full" />
        </View>
      ) : isError ? (
        <ErrorState message="Não foi possível carregar o seu perfil." actionLabel="Tentar novamente" onAction={() => refetch()} />
      ) : null}
    </Screen>
  );
}
