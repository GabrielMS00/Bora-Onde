import { StubScreen } from '@/components/dev/StubScreen';
import { Button } from '@/components/ui/Button';
import { useSession } from '@/features/auth/session';

export default function SignupEstablishmentScreen() {
  const { signInAs } = useSession();

  return (
    <StubScreen title="Cadastro do local" figma="1.4" phase={4} back>
      <Button label="Cadastrar estabelecimento (mock)" onPress={() => signInAs('establishment')} />
    </StubScreen>
  );
}
