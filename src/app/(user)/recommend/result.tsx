import { router } from 'expo-router';

import { StubScreen } from '@/components/dev/StubScreen';
import { Button } from '@/components/ui/Button';

export default function RecommendResultScreen() {
  return (
    <StubScreen title="Resultado da indicação" figma="2.3" phase={5} tab>
      <Button label="Tentar outra indicação" onPress={() => router.dismissTo('/recommend')} />
      <Button label="Voltar ao feed" variant="fantasma" size="medio" onPress={() => router.navigate('/feed')} />
    </StubScreen>
  );
}
