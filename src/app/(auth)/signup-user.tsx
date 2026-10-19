import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { CityField } from '@/components/ui/CityField';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Segmented } from '@/components/ui/Selectors';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { useToast } from '@/components/ui/Toast';
import { AuthFailure, registerUser } from '@/features/auth/authApi';
import { signupUserSchema, type SignupUserForm } from '@/features/auth/schemas';

const GENDERS = [
  { value: 'F', label: 'Feminino' },
  { value: 'M', label: 'Masculino' },
] as const;

export default function SignupUserScreen() {
  const toast = useToast();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignupUserForm>({
    resolver: zodResolver(signupUserSchema),
    defaultValues: { name: '', age: '', city: '', email: '', password: '' },
  });

  const submit = handleSubmit(async (form) => {
    try {
      await registerUser(form);
    } catch (e) {
      toast.show('error', e instanceof AuthFailure ? e.message : 'Não foi possível criar a conta. Tente novamente.');
    }
  });

  return (
    <Screen
      header={<ScreenHeader title="Cadastro" />}
      footer={<Button label="Criar conta" onPress={submit} loading={isSubmitting} />}>
      <View className="gap-1 pb-5 pt-2">
        <Text variant="h1">Crie sua conta</Text>
        <Text variant="corpo-sm" tone="secundario">
          Leva menos de um minuto.
        </Text>
      </View>

      <View className="gap-4">
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <TextField
              label="Nome completo"
              placeholder="Como você se chama"
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="age"
          render={({ field, fieldState }) => (
            <TextField
              label="Idade"
              placeholder="Ex.: 27"
              keyboardType="number-pad"
              maxLength={3}
              value={field.value}
              onChangeText={(v) => field.onChange(v.replace(/\D/g, ''))}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="gender"
          render={({ field, fieldState }) => (
            <View className="gap-2">
              <Text variant="rotulo">Sexo</Text>
              <Segmented options={GENDERS} value={field.value} onChange={field.onChange} />
              {fieldState.error ? (
                <Text variant="corpo-sm" tone="erro">
                  {fieldState.error.message}
                </Text>
              ) : null}
            </View>
          )}
        />
        <Controller
          control={control}
          name="city"
          render={({ field, fieldState }) => (
            <CityField value={field.value} onChange={field.onChange} error={fieldState.error?.message} />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <TextField
              label="E-mail"
              placeholder="voce@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field, fieldState }) => (
            <TextField
              label="Senha"
              password
              placeholder="Crie uma senha"
              hint="Mínimo de 8 caracteres"
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="go"
              onSubmitEditing={submit}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
            />
          )}
        />
      </View>
    </Screen>
  );
}
