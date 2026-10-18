import { StubScreen } from '@/components/dev/StubScreen';
import { Button } from '@/components/ui/Button';
import { useSession } from '@/features/auth/session';

export default function SignupUserScreen() {
  const { signInAs } = useSession();

  return (
    <StubScreen title="Cadastro" figma="1.3" phase={3} back>
      <Button label="Criar conta (mock)" onPress={() => signInAs('user')} />
    </StubScreen>
  );
}
