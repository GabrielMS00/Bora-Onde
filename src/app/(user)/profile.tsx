import { StubScreen } from '@/components/dev/StubScreen';
import { Button } from '@/components/ui/Button';
import { useSession } from '@/features/auth/session';

export default function UserProfileScreen() {
  const { signOut } = useSession();

  return (
    <StubScreen title="Meu perfil" figma="2.4" phase={5} tab>
      <Button label="Sair da conta" variant="fantasma" size="medio" onPress={signOut} />
    </StubScreen>
  );
}
