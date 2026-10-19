import { DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold } from '@expo-google-fonts/dm-sans';
import {
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { useFonts } from 'expo-font';

export function useAppFonts() {
  return useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
}
