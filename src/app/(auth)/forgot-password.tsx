import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { EnvelopeSimple } from 'phosphor-react-native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { forgotPasswordSchema, type ForgotPasswordForm } from '@/features/auth/schemas';
import { colors } from '@/theme/tokens';

// 1.5 Recuperar senha — SOMENTE UI (decisão do projeto): valida o e-mail e mostra o modal 1.5s, sem enviar nada.
// A mensagem é a mesma exista ou não a conta, para não revelar quais e-mails estão cadastrados.
export default function ForgotPasswordScreen() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const { control, handleSubmit } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const submit = handleSubmit(({ email }) => setSentTo(email.trim()));

  return (
    <Screen
      header={<ScreenHeader title="Recuperar senha" />}
      footer={
        <View className="gap-3">
          <Button label="Enviar link de recuperação" onPress={submit} />
          <Button label="Voltar para o login" variant="fantasma" onPress={() => router.dismissTo('/login')} />
        </View>
      }>
      <View className="gap-4 pt-4">
        <View className="h-14 w-14 items-center justify-center rounded-pilula bg-superficie-alt">
          <EnvelopeSimple size={28} color={colors.texto} />
        </View>
        <View className="gap-2">
          <Text variant="h1">Recuperar senha</Text>
          <Text variant="corpo" tone="secundario">
            Informe o e-mail da sua conta. Vamos enviar um link para você criar uma nova senha.
          </Text>
        </View>
        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <TextField
              label="E-mail cadastrado"
              placeholder="voce@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="send"
              onSubmitEditing={submit}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
            />
          )}
        />
      </View>

      <ConfirmModal
        visible={sentTo !== null}
        type="sucesso"
        title="Link enviado!"
        message={`Enviamos as instruções para ${sentTo ?? ''}. Confira também a caixa de spam.`}
        confirmLabel="Voltar para o login"
        onConfirm={() => {
          setSentTo(null);
          router.dismissTo('/login');
        }}
      />
    </Screen>
  );
}
