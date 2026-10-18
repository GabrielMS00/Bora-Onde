import { StubScreen } from '@/components/dev/StubScreen';
import { Button } from '@/components/ui/Button';
import { useSession } from '@/features/auth/session';

export default function PlaceProfileScreen() {
  const { signOut } = useSession();

  return (
    <StubScreen title="Perfil do local" figma="3.3" phase={4} tab>
      <Button label="Sair da conta" variant="fantasma" size="medio" onPress={signOut} />
    </StubScreen>
  );
}
