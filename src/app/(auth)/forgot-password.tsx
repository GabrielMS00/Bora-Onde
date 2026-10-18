import { router } from 'expo-router';

import { StubScreen } from '@/components/dev/StubScreen';
import { Button } from '@/components/ui/Button';

export default function ForgotPasswordScreen() {
  return (
    <StubScreen title="Recuperar senha" figma="1.5" phase={3} back>
      <Button label="Voltar para o login" variant="secundario" onPress={() => router.dismissTo('/login')} />
    </StubScreen>
  );
}
