"use client";

import * as React from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_DISH_BUCKET || "dishes";

type Props = {
  value?: string | null;
  onChange: (url: string | null) => void;
};

export default function DishImageUploader({ value, onChange }: Props) {
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);

    const ext = file.name.split(".").pop() || "jpg";
    const safeExt = ext.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `dishes/${crypto.randomUUID()}.${safeExt}`;

    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });

    if (upErr) {
      setUploading(false);
      setError(upErr.message);
      return;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    onChange(data.publicUrl);

    setUploading(false);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <label className="inline-flex items-center">
          <span className="sr-only">Carica immagine</span>
          <input
            type="file"
            accept="image/*"
            className="block text-sm"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
            }}
          />
        </label>

        {value ? (
          <button
            type="button"
            className="text-sm text-black/70 hover:text-black underline underline-offset-2"
            onClick={() => onChange(null)}
            disabled={uploading}
          >
            Rimuovi
          </button>
        ) : null}
      </div>

      {value ? (
        <div className="flex items-center gap-3">
          {/* preview */}
          <img
            src={value}
            alt="Anteprima"
            className="h-14 w-14 rounded-xl object-cover ring-1 ring-black/10"
          />
          <div className="text-xs text-black/60 break-all">{value}</div>
        </div>
      ) : (
        <div className="text-xs text-black/50">Nessuna immagine</div>
      )}

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}
    </div>
  );
}
