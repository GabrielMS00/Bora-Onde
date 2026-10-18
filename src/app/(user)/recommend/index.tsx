import { router } from 'expo-router';

import { StubScreen } from '@/components/dev/StubScreen';
import { Button } from '@/components/ui/Button';

export default function RecommendQuizScreen() {
  return (
    <StubScreen title="Bora decidir?" figma="2.2" phase={5} tab>
      <Button label="Descobrir Bora Onde" onPress={() => router.push('/recommend/result')} />
    </StubScreen>
  );
}
