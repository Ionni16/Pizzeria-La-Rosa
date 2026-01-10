"use client";

import * as React from "react";

export default function SafeImg({
  src,
  alt = "",
  className,
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  const [broken, setBroken] = React.useState(false);

  if (!src || broken) return null;

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => setBroken(true)}
    />
  );
}
