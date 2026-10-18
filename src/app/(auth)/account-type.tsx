import { router } from 'expo-router';

import { StubScreen } from '@/components/dev/StubScreen';
import { Button } from '@/components/ui/Button';

export default function AccountTypeScreen() {
  return (
    <StubScreen title="Criar conta" figma="1.2" phase={3} back>
      <Button label="Usuário padrão" onPress={() => router.push('/signup-user')} />
      <Button label="Dono de estabelecimento" variant="secundario" onPress={() => router.push('/signup-establishment')} />
      <Button label="Já tenho conta. Entrar" variant="fantasma" size="medio" onPress={() => router.dismissTo('/login')} />
    </StubScreen>
  );
}
