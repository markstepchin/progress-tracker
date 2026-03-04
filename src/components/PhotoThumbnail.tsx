"use client";

import Image from "next/image";

interface PhotoThumbnailProps {
  src: string;
  alt: string;
  label?: string;
  onClick?: (e: React.MouseEvent) => void;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-16 w-16",
  md: "h-24 w-24",
  lg: "h-32 w-32",
};

export function PhotoThumbnail({
  src,
  alt,
  label,
  onClick,
  size = "md",
}: PhotoThumbnailProps) {
  // Use regular img tag for UploadThing URLs to avoid Next.js optimization issues
  const isUploadThingUrl =
    src && (src.includes("utfs.io") || src.includes("ufs.sh"));

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative ${sizeClasses[size]} overflow-hidden rounded-lg bg-zinc-100 transition-transform active:scale-95`}
    >
      {isUploadThingUrl ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover transition-opacity group-hover:opacity-90"
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover transition-opacity group-hover:opacity-90"
          sizes="(max-width: 768px) 96px, 128px"
        />
      )}
      {label && (
        <span className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent px-1 py-0.5 text-center text-xs font-medium text-white">
          {label}
        </span>
      )}
    </button>
  );
}
