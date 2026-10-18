import { FeedScreen } from '@/features/feed/FeedScreen';

// 3.1 Feed da região: igual ao do usuário, com o aviso de como o próprio lugar aparece.
export default function RegionFeedScreen() {
  return <FeedScreen mode="establishment" />;
}
