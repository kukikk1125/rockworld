"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { getAssetPath } from "@/lib/assets";

export function PetImage({
  src,
  alt,
  className,
  priority,
}: {
  src?: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const [imageSrc, setImageSrc] = useState(src ? getAssetPath(src) : getAssetPath("/pets/placeholder.png"));

  return (
    <div className={cn("relative rounded-2xl bg-white", className)}>
      <Image
        src={imageSrc}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 402px) calc(100vw - 24px), (max-width: 768px) 50vw, 20vw"
        className="object-contain"
        unoptimized
        onError={() => setImageSrc(getAssetPath("/pets/placeholder.png"))}
      />
    </div>
  );
}
