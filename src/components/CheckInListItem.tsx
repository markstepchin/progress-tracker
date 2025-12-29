"use client";

import Link from "next/link";
import { useState } from "react";
import { formatDate, formatWeight } from "~/utils/formatters";
import { PhotoThumbnail } from "./PhotoThumbnail";
import { PhotoModal } from "./PhotoModal";

interface CheckInListItemProps {
  id: string;
  date: Date;
  weight: number | null;
  frontPhoto: string;
  sidePhoto: string;
  backPhoto: string;
}

export function CheckInListItem({
  id,
  date,
  weight,
  frontPhoto,
  sidePhoto,
  backPhoto,
}: CheckInListItemProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  const photos = [
    { src: frontPhoto, label: "Front" },
    { src: sidePhoto, label: "Side" },
    { src: backPhoto, label: "Back" },
  ];

  const handlePhotoClick = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setModalIndex(index);
    setModalOpen(true);
  };

  return (
    <>
      <Link
        href={`/check-in/${id}`}
        className="block rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:border-zinc-300 hover:shadow-sm active:scale-[0.99]"
      >
        <div className="flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-zinc-900">{formatDate(date)}</p>
            <p className="text-sm text-zinc-500">{formatWeight(weight)}</p>
          </div>

          <div className="flex gap-2">
            {photos.map((photo, index) => (
              <PhotoThumbnail
                key={photo.label}
                src={photo.src}
                alt={photo.label}
                label={photo.label}
                size="sm"
                onClick={(e) => handlePhotoClick(index, e)}
              />
            ))}
          </div>
        </div>
      </Link>

      {modalOpen && (
        <PhotoModal
          photos={photos}
          currentIndex={modalIndex}
          onClose={() => setModalOpen(false)}
          onNavigate={setModalIndex}
        />
      )}
    </>
  );
}
