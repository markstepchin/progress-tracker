"use client";

import Image from "next/image";
import { useState, useCallback } from "react";
import { UploadDropzone } from "~/utils/uploadthing";

type PhotoPosition = "front" | "side" | "back";

interface UploadedPhoto {
  url: string;
  position: PhotoPosition | null;
}

interface PhotoAssignment {
  frontPhotoUrl: string;
  sidePhotoUrl: string;
  backPhotoUrl: string;
}

interface PhotoUploadFlowProps {
  onPhotosAssigned: (photos: PhotoAssignment) => void;
  onError: (error: string) => void;
}

export function PhotoUploadFlow({
  onPhotosAssigned,
  onError,
}: PhotoUploadFlowProps) {
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadComplete = useCallback((res: { url: string }[]) => {
    setIsUploading(false);
    const newPhotos: UploadedPhoto[] = res.map((file) => ({
      url: file.url,
      position: null,
    }));
    setUploadedPhotos(newPhotos);
  }, []);

  const handleUploadError = useCallback(
    (error: Error) => {
      setIsUploading(false);
      onError(error.message || "Failed to upload photos");
    },
    [onError],
  );

  const handlePositionChange = (index: number, position: PhotoPosition) => {
    setUploadedPhotos((prev) => {
      const updated = prev.map((photo, i) => {
        if (i === index) {
          return { ...photo, position };
        }
        // Remove this position from other photos
        if (photo.position === position) {
          return { ...photo, position: null };
        }
        return photo;
      });
      return updated;
    });
  };

  const handleConfirmAssignment = () => {
    const front = uploadedPhotos.find((p) => p.position === "front");
    const side = uploadedPhotos.find((p) => p.position === "side");
    const back = uploadedPhotos.find((p) => p.position === "back");

    if (!front || !side || !back) {
      onError("Please assign all photos: Front, Side, and Back");
      return;
    }

    onPhotosAssigned({
      frontPhotoUrl: front.url,
      sidePhotoUrl: side.url,
      backPhotoUrl: back.url,
    });
  };

  const allPositionsAssigned =
    uploadedPhotos.length === 3 &&
    uploadedPhotos.every((p) => p.position !== null);

  const resetUpload = () => {
    setUploadedPhotos([]);
  };

  // Show upload dropzone if no photos uploaded yet
  if (uploadedPhotos.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="mb-1 text-sm font-medium text-zinc-900">
            Upload 3 Photos
          </h3>
          <p className="text-xs text-zinc-500">Front, Side, and Back views</p>
        </div>

        <UploadDropzone
          endpoint="imageUploader"
          onUploadBegin={() => setIsUploading(true)}
          onClientUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
          config={{ mode: "auto" }}
          appearance={{
            container:
              "border-2 border-dashed border-zinc-300 rounded-xl p-8 bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer",
            uploadIcon: "text-zinc-400 w-12 h-12",
            label: "text-zinc-600 text-sm",
            allowedContent: "text-zinc-400 text-xs",
            button:
              "bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 ut-uploading:bg-zinc-500",
          }}
          content={{
            label: isUploading ? "Uploading..." : "Select exactly 3 photos",
            allowedContent: "Images up to 8MB each",
          }}
        />
      </div>
    );
  }

  // Show assignment UI
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-900">
          Assign Photo Positions
        </h3>
        <button
          type="button"
          onClick={resetUpload}
          className="text-xs text-zinc-500 hover:text-zinc-700"
        >
          Reset
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {uploadedPhotos.map((photo, index) => (
          <div key={index} className="space-y-2">
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-zinc-100">
              <Image
                src={photo.url}
                alt={`Photo ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 30vw, 150px"
              />
            </div>

            <select
              value={photo.position ?? ""}
              onChange={(e) =>
                handlePositionChange(index, e.target.value as PhotoPosition)
              }
              className={`w-full rounded-lg border px-2 py-1.5 text-sm focus:ring-2 focus:ring-zinc-400 focus:outline-none ${
                photo.position
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 bg-white text-zinc-600"
              }`}
            >
              <option value="">Select...</option>
              <option value="front">Front</option>
              <option value="side">Side</option>
              <option value="back">Back</option>
            </select>
          </div>
        ))}
      </div>

      {uploadedPhotos.length !== 3 && (
        <p className="text-center text-sm text-amber-600">
          Please upload exactly 3 photos. You uploaded {uploadedPhotos.length}.
        </p>
      )}

      <button
        type="button"
        onClick={handleConfirmAssignment}
        disabled={!allPositionsAssigned}
        className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
      >
        {allPositionsAssigned ? "Confirm Photos" : "Assign all positions"}
      </button>
    </div>
  );
}
