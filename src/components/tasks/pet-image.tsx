"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { getAssetPath } from "@/lib/assets";

type ImageType = "thumbnail" | "detail";

export function PetImage({
  src,
  thumbnailSrc,
  detailSrc,
  alt,
  className,
  priority,
  type = "thumbnail",
}: {
  src?: string;
  thumbnailSrc?: string;
  detailSrc?: string;
  alt: string;
  className?: string;
  priority?: boolean;
  type?: ImageType;
}) {
  const getImagePath = () => {
    if (type === "thumbnail" && thumbnailSrc) {
      return getAssetPath(thumbnailSrc);
    }
    if (type === "detail" && detailSrc) {
      return getAssetPath(detailSrc);
    }
    if (src) {
      return getAssetPath(src);
    }
    return getAssetPath("/pets/placeholder.png");
  };

  const [imageSrc, setImageSrc] = useState(getImagePath());

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
