// lib/supabase/storage.ts
export const DISH_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_DISH_BUCKET?.trim() || "dish-images";

/**
 * Estrae il path del file dal public URL di Supabase:
 * .../storage/v1/object/public/<bucket>/<path>
 */
export function getStoragePathFromPublicUrl(publicUrl: string, bucket = DISH_BUCKET) {
  try {
    const u = new URL(publicUrl);
    const marker = `/storage/v1/object/public/${bucket}/`;
    const idx = u.pathname.indexOf(marker);
    if (idx === -1) return null;
    return decodeURIComponent(u.pathname.slice(idx + marker.length));
  } catch {
    return null;
  }
}

/** Ritorna un nome file safe */
export function safeFilename(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_\.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}
