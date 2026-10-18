import { router } from 'expo-router';

import { StubScreen } from '@/components/dev/StubScreen';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { useSession } from '@/features/auth/session';

export default function LoginScreen() {
  const { signInAs } = useSession();

  return (
    <StubScreen title="Login" figma="1.1" phase={3}>
      <Logo variant="empilhado" height={104} />
      <Button label="Entrar como usuário (mock)" onPress={() => signInAs('user')} />
      <Button label="Entrar como estabelecimento (mock)" variant="secundario" onPress={() => signInAs('establishment')} />
      <Button label="Criar nova conta" variant="contorno" onPress={() => router.push('/account-type')} />
      <Button label="Esqueci minha senha" variant="fantasma" size="medio" onPress={() => router.push('/forgot-password')} />
      <Button label="UI Kit (dev)" variant="fantasma" size="medio" onPress={() => router.push('/dev/components')} />
    </StubScreen>
  );
}
