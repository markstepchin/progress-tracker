"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDateWithDay, formatWeight } from "~/utils/formatters";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
import { PhotoModal } from "./PhotoModal";
import { api } from "~/trpc/react";

interface CheckInDetailProps {
  id: string;
  date: Date;
  weight: number | null;
  notes: string | null;
  frontPhoto: string;
  sidePhoto: string;
  backPhoto: string;
}

export function CheckInDetail({
  id,
  date,
  weight,
  notes,
  frontPhoto,
  sidePhoto,
  backPhoto,
}: CheckInDetailProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const utils = api.useUtils();
  const deleteMutation = api.checkIn.delete.useMutation({
    onSuccess: () => {
      void utils.checkIn.getAll.invalidate();
      router.push("/");
    },
  });

  const photos = [
    { src: frontPhoto, label: "Front" },
    { src: sidePhoto, label: "Side" },
    { src: backPhoto, label: "Back" },
  ];

  const photoUrls = photos.map((p) => p.src).filter(Boolean);
  const { data: metadataList } = api.checkIn.getImageMetadata.useQuery(
    { urls: photoUrls },
    { enabled: photoUrls.length > 0 },
  );

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync({ id });
    } catch (error) {
      console.error("Failed to delete check-in:", error);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">
              {formatDateWithDay(date)}
            </h1>
            <p className="text-lg text-zinc-600">{formatWeight(weight)}</p>
          </div>

          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-red-500"
            aria-label="Delete check-in"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>

        {/* Photos Grid */}
        <div className="grid grid-cols-3 gap-3">
          {photos.map((photo, index) => {
            const meta = metadataList?.[index];
            const dateStr = (meta?.dateTaken ?? meta?.lastModified)
              ? new Date(meta.dateTaken ?? meta.lastModified!).toLocaleDateString(
                  undefined,
                  { dateStyle: "medium" },
                )
              : null;
            const typeStr = meta?.contentType
              ? meta.contentType.replace(/^image\//i, "").toUpperCase()
              : null;
            return (
              <div key={photo.label} className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setModalIndex(index);
                    setModalOpen(true);
                  }}
                  className="group relative aspect-4/5 w-full overflow-hidden rounded-lg bg-zinc-100 transition-transform active:scale-[0.98]"
                >
                  {photo.src && photo.src.includes("ufs.sh") ? (
                    <img
                      src={photo.src}
                      alt={photo.label}
                      className="h-full w-full object-cover transition-opacity group-hover:opacity-90"
                    />
                  ) : (
                    <Image
                      src={photo.src}
                      alt={photo.label}
                      fill
                      className="object-cover transition-opacity group-hover:opacity-90"
                      sizes="(max-width: 768px) 33vw, 200px"
                    />
                  )}
                  <span className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                    {photo.label}
                  </span>
                </button>
                {(dateStr || meta?.size !== undefined || typeStr) && (
                  <div className="text-xs text-zinc-500 space-y-0.5">
                    {dateStr && <div>Date: {dateStr}</div>}
                    {meta?.size !== undefined && (
                      <div>Size: {formatFileSize(meta.size)}</div>
                    )}
                    {typeStr && <div>Type: {typeStr}</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Notes */}
        {notes && (
          <div className="rounded-lg bg-zinc-50 p-4">
            <h2 className="mb-2 text-sm font-medium text-zinc-500">Notes</h2>
            <p className="whitespace-pre-wrap text-zinc-900">{notes}</p>
          </div>
        )}
      </div>

      {/* Photo Modal */}
      {modalOpen && (
        <PhotoModal
          photos={photos}
          currentIndex={modalIndex}
          onClose={() => setModalOpen(false)}
          onNavigate={setModalIndex}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-2 text-lg font-semibold text-zinc-900">
              Delete Check-In?
            </h3>
            <p className="mb-6 text-sm text-zinc-600">
              This action cannot be undone. This will permanently delete this
              check-in and all associated photos.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
