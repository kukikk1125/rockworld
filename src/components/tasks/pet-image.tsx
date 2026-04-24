"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
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
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 via-white to-rose-100 text-center",
          className,
        )}
      >
        <span className="px-1 text-[10px] font-bold text-muted-foreground">
          {alt.slice(0, 2)}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("relative rounded-2xl bg-white", className)}>
      <Image
        src={getAssetPath(src)}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 402px) calc(100vw - 24px), (max-width: 768px) 50vw, 20vw"
        className="object-contain"
        unoptimized
        onError={() => setFailed(true)}
      />
    </div>
  );
}
