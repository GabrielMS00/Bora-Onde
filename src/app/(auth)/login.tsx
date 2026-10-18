import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Flask } from 'phosphor-react-native';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { useToast } from '@/components/ui/Toast';
import { AuthFailure, signIn } from '@/features/auth/authApi';
import { DEMO_ACCOUNTS } from '@/features/auth/demo';
import { loginSchema, type LoginForm } from '@/features/auth/schemas';
import { colors } from '@/theme/tokens';

// 1.1 Login. Ao entrar, a sessão muda e o guard do layout raiz leva ao fluxo do papel (feed do usuário / da região).
export default function LoginScreen() {
  const toast = useToast();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });

  const login = async (email: string, password: string) => {
    try {
      await signIn(email, password);
    } catch (e) {
      toast.show('error', e instanceof AuthFailure ? e.message : 'Não foi possível entrar. Tente novamente.');
    }
  };
  const submit = handleSubmit(({ email, password }) => login(email, password));

  return (
    <Screen>
      <View className="items-center gap-4 pb-6 pt-9">
        <Logo variant="empilhado" height={104} />
        <Text variant="corpo" tone="secundario" className="text-center">
          Descubra onde comer e beber sem passar horas decidindo.
        </Text>
      </View>

      <View className="gap-4">
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
              returnKeyType="next"
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
              placeholder="Sua senha"
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={submit}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
            />
          )}
        />
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Esqueci minha senha"
          hitSlop={8}
          onPress={() => router.push('/forgot-password')}
          className="h-9 justify-center self-start">
          <Text variant="rotulo-forte">Esqueci minha senha</Text>
        </Pressable>

        <Button label="Entrar" onPress={submit} loading={isSubmitting} />

        <View className="flex-row items-center gap-3">
          <View className="h-px flex-1 bg-linha" />
          <Text variant="legenda" tone="secundario">
            ou
          </Text>
          <View className="h-px flex-1 bg-linha" />
        </View>

        <Button label="Criar nova conta" variant="contorno" onPress={() => router.push('/account-type')} />
      </View>

      {/* Substitui o "atalho do protótipo" do Figma: entra direto com uma conta de demonstração. */}
      <View className="items-center gap-2 pb-2 pt-8">
        <View className="flex-row items-center gap-1">
          <Flask size={14} color={colors['texto-secundario']} />
          <Text variant="legenda" tone="secundario">
            Modo demonstração
          </Text>
        </View>
        <View className="flex-row flex-wrap justify-center gap-2">
          {(['user', 'establishment'] as const).map((kind) => (
            <Pressable
              key={kind}
              accessibilityRole="button"
              accessibilityLabel={`Entrar como ${DEMO_ACCOUNTS[kind].label} demo`}
              disabled={isSubmitting}
              onPress={() => login(DEMO_ACCOUNTS[kind].email, DEMO_ACCOUNTS[kind].password)}
              style={{ borderStyle: 'dashed' }}
              className="h-9 justify-center rounded-md border border-linha-controle px-3 active:bg-superficie-alt">
              <Text variant="legenda">Entrar como {DEMO_ACCOUNTS[kind].label} demo</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Screen>
  );
}
