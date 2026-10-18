import { supabase, PLACE_PHOTOS_BUCKET } from '@/data/supabase';
import type { PickedImage } from '@/lib/image';

const extensions: Record<string, string> = { 'image/png': 'png', 'image/webp': 'webp' };

/** Envia uma foto para `{uid}/…` (única pasta onde o RLS permite escrever) e devolve o path salvo no banco. */
export async function uploadPhoto(uid: string, image: PickedImage): Promise<string> {
  const mime = image.mimeType ?? 'image/jpeg';
  const path = `${uid}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extensions[mime] ?? 'jpg'}`;

  const body = await (await fetch(image.uri)).arrayBuffer();
  const { error } = await supabase.storage.from(PLACE_PHOTOS_BUCKET).upload(path, body, { contentType: mime });
  if (error) throw new Error(`Falha ao enviar a foto: ${error.message}`);
  return path;
}

/** Remove do bucket só o que pertence ao dono (fotos de seed ficam em seed/…, fora da policy). */
export async function removePhotos(uid: string, paths: string[]) {
  const own = paths.filter((p) => p.startsWith(`${uid}/`));
  if (own.length > 0) await supabase.storage.from(PLACE_PHOTOS_BUCKET).remove(own);
}

export async function removeAllMyPhotos(uid: string) {
  const { data } = await supabase.storage.from(PLACE_PHOTOS_BUCKET).list(uid, { limit: 100 });
  if (data?.length) await removePhotos(uid, data.map((f) => `${uid}/${f.name}`));
}
