// app/admin/(protected)/dishes/_components/DishImagePreview.tsx
import Image from "next/image";

export default function DishImagePreview({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl ring-1 ring-black/10 bg-black/5">
      <div className="relative h-48 w-full">
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 700px"
        />
      </div>
    </div>
  );
}
