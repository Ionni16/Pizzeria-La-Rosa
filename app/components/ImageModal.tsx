"use client";

import * as React from "react";
import Image from "next/image";

type ImageModalProps = {
  open: boolean;
  src: string;
  alt: string;
  onClose: () => void;
};

export default function ImageModal({ open, src, alt, onClose }: ImageModalProps) {
  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    // CLICK OVUNQUE = CHIUDE
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-[2px] p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Immagine"
      onClick={onClose}
    >
      {/* X come hint visivo (non serve cliccarla) */}
      <div className="pointer-events-none absolute right-4 top-4 z-10">
        <div className="rounded-full bg-black/55 px-3 py-2 text-white/90 ring-1 ring-white/10 backdrop-blur">
          ✕
        </div>
      </div>

      {/* Card immagine */}
      <div className="relative w-full max-w-5xl overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/25">
        {/* Altezza controllata */}
        <div className="relative h-[80vh] max-h-[860px] w-full">
          {/* BACKGROUND: stessa immagine, cover + blur (riempie e toglie le bande) */}
          <div className="absolute inset-0">
            <Image
              src={src}
              alt=""
              fill
              sizes="100vw"
              className="object-cover blur-2xl scale-110 opacity-60"
              aria-hidden="true"
            />
            {/* leggero scurimento per eleganza */}
            <div className="absolute inset-0 bg-black/20" />
          </div>

          {/* FOREGROUND: immagine vera, contain (pizza intera) */}
          <Image
            src={src}
            alt={alt}
            fill
            priority
            sizes="(max-width: 640px) 100vw, 1100px"
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}
