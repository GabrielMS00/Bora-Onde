import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export type PickedImage = { uri: string; mimeType?: string };

export type PickResult = {
  images: PickedImage[];
  tooLarge: number;
  denied: boolean;
};

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export async function pickImages(limit: number): Promise<PickResult> {
  const empty: PickResult = { images: [], tooLarge: 0, denied: false };
  if (limit <= 0) return empty;

  if (Platform.OS === 'ios') {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return { ...empty, denied: true };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    selectionLimit: limit,
    quality: 0.7,
  });
  if (result.canceled) return empty;

  const fits = result.assets.filter((a) => (a.fileSize ?? 0) <= MAX_PHOTO_BYTES);
  return {
    images: fits.slice(0, limit).map((a) => ({ uri: a.uri, mimeType: a.mimeType })),
    tooLarge: result.assets.length - fits.length,
    denied: false,
  };
}
