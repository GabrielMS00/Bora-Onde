import { ScrollView, View } from 'react-native';

import { AddPhotoTile, PhotoThumb } from '@/components/ui/Photo';
import { useToast } from '@/components/ui/Toast';
import { pickImages } from '@/lib/image';

export const MAX_PHOTOS = 10;

/** Foto em edição: já salva (tem `path` no Storage) ou recém-escolhida (só `uri` local, ainda não enviada). */
export type PhotoItem = { key: string; uri: string; path?: string; mimeType?: string };

type Props = {
  items: PhotoItem[];
  onChange: (items: PhotoItem[]) => void;
  /** Cadastro (1.4): botão "Adicionar" antes das miniaturas. Perfil do local (3.3): depois. */
  addFirst?: boolean;
};

// Figma › Foto › "Miniatura e adicionar": miniaturas 96 px com X, tile tracejado para adicionar, até 10 fotos.
// A primeira foto vira a capa no feed; a ordem é a da lista.
export function PhotoManager({ items, onChange, addFirst }: Props) {
  const toast = useToast();

  const add = async () => {
    try {
      const { images, tooLarge, denied } = await pickImages(MAX_PHOTOS - items.length);
      if (denied) {
        toast.show('error', 'Permissão para acessar as fotos negada. Ative nas configurações do aparelho.');
        return;
      }
      if (tooLarge > 0) {
        toast.show('error', `${tooLarge === 1 ? 'Uma foto passa' : `${tooLarge} fotos passam`} de 5 MB e não ${tooLarge === 1 ? 'foi adicionada' : 'foram adicionadas'}.`);
      }
      if (images.length > 0) {
        const stamp = Date.now();
        onChange([...items, ...images.map((img, i) => ({ key: `new-${stamp}-${i}`, uri: img.uri, mimeType: img.mimeType }))]);
      }
    } catch {
      toast.show('error', 'Não foi possível abrir a galeria. Tente novamente.');
    }
  };

  const canAdd = items.length < MAX_PHOTOS;
  const addTile = canAdd ? <AddPhotoTile key="add" onPress={add} /> : null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3 pr-5">
      {addFirst ? addTile : null}
      {items.map((item) => (
        <View key={item.key}>
          <PhotoThumb uri={item.uri} onRemove={() => onChange(items.filter((i) => i.key !== item.key))} />
        </View>
      ))}
      {addFirst ? null : addTile}
    </ScrollView>
  );
}
