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

function formatDateForInput(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDate, setEditDate] = useState(formatDateForInput(date));
  const [editWeight, setEditWeight] = useState(weight?.toString() ?? "");
  const [editNotes, setEditNotes] = useState(notes ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const utils = api.useUtils();
  const deleteMutation = api.checkIn.delete.useMutation({
    onSuccess: () => {
      void utils.checkIn.getAll.invalidate();
      router.push("/");
    },
  });

  const updateMutation = api.checkIn.update.useMutation({
    onSuccess: () => {
      void utils.checkIn.getById.invalidate({ id });
      void utils.checkIn.getAll.invalidate();
      setShowEditModal(false);
      setIsSaving(false);
    },
    onError: () => {
      setIsSaving(false);
    },
  });

  const handleOpenEditModal = () => {
    setEditDate(formatDateForInput(date));
    setEditWeight(weight?.toString() ?? "");
    setEditNotes(notes ?? "");
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    const parsedWeight = editWeight.trim() ? parseFloat(editWeight) : null;
    await updateMutation.mutateAsync({
      id,
      date: new Date(editDate),
      weight: parsedWeight,
      notes: editNotes.trim() || undefined,
    });
  };

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

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleOpenEditModal}
              className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
              aria-label="Edit check-in"
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
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                />
              </svg>
            </button>
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

      {/* Edit Modal */}
      {showEditModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-lg font-semibold text-zinc-900">
              Edit Check-In
            </h3>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="edit-date"
                  className="mb-1.5 block text-sm font-medium text-zinc-700"
                >
                  Date
                </label>
                <input
                  id="edit-date"
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-zinc-400 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-weight"
                  className="mb-1.5 block text-sm font-medium text-zinc-700"
                >
                  Weight (lbs)
                </label>
                <input
                  id="edit-weight"
                  type="number"
                  step="0.1"
                  placeholder="Enter weight"
                  value={editWeight}
                  onChange={(e) => setEditWeight(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-zinc-400 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-notes"
                  className="mb-1.5 block text-sm font-medium text-zinc-700"
                >
                  Notes
                </label>
                <textarea
                  id="edit-notes"
                  rows={3}
                  placeholder="Add notes..."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full resize-none rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-zinc-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                disabled={isSaving}
                className="flex-1 rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSaving || !editDate}
                className="flex-1 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
