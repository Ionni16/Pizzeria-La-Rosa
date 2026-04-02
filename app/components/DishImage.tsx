"use client";

import * as React from "react";
import Image from "next/image";
import ImageModal from "./ImageModal";

type DishImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
};

function normalizeSrc(src?: string | null) {
  const s = (src ?? "").trim();
  if (!s) return null;

  try {
    new URL(s);
    return s;
  } catch {
    return s;
  }
}

export default function DishImage({ src, alt, className }: DishImageProps) {
  const normalized = React.useMemo(() => normalizeSrc(src), [src]);
  const [failedSrc, setFailedSrc] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);

  // Nessuna immagine -> non renderizzare nulla
  if (!normalized) return null;

  // Se questo URL ha fallito -> sparisce (niente broken icon, niente placeholder)
  if (failedSrc === normalized) return null;

  return (
    <>
      {/* Thumbnail TONDA stile "medaglione" */}
      <button
        type="button"
        aria-label="Apri immagine"
        onClick={() => setOpen(true)}
        className={[
          "relative shrink-0",
          "h-12 w-12 sm:h-14 sm:w-14",
          "rounded-full overflow-hidden",
          "ring-1 ring-black/10 bg-white",
          "shadow-sm",
          "transition hover:shadow-md hover:ring-black/20",
          "focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-red)]/30",
          className ?? "",
        ].join(" ")}
      >
        <Image
          src={normalized}
          alt={alt}
          fill
          sizes="56px"
          className="object-cover"
          onError={() => setFailedSrc(normalized)}
        />
      </button>

      <ImageModal open={open} src={normalized} alt={alt} onClose={() => setOpen(false)} />
    </>
  );
}
