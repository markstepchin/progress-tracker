"use client";

import Image from "next/image";
import { useState, useCallback } from "react";
import { UploadDropzone } from "~/utils/uploadthing";
import heic2any from "heic2any";

type PhotoPosition = "front" | "side" | "back";

interface PhotoAssignment {
  frontPhotoUrl: string;
  sidePhotoUrl: string;
  backPhotoUrl: string;
}

interface PhotoUploadFlowProps {
  onPhotosAssigned: (photos: PhotoAssignment) => void;
  onError: (error: string) => void;
}

interface PhotoState {
  front: string | null;
  side: string | null;
  back: string | null;
}

export function PhotoUploadFlow({
  onPhotosAssigned,
  onError,
}: PhotoUploadFlowProps) {
  const [photos, setPhotos] = useState<PhotoState>({
    front: null,
    side: null,
    back: null,
  });
  const [uploading, setUploading] = useState<PhotoPosition | null>(null);

  const handleUploadComplete = useCallback(
    (position: PhotoPosition) => (res: { ufsUrl: string }[]) => {
      setUploading(null);
      if (res.length > 0) {
        setPhotos((prev) => ({
          ...prev,
          [position]: res[0].ufsUrl,
        }));
      }
    },
    [],
  );

  const handleUploadError = useCallback(
    (error: Error) => {
      setUploading(null);
      onError(error.message || "Failed to upload photo");
    },
    [onError],
  );

  const convertHeicToJpeg = useCallback(async (file: File): Promise<File> => {
    if (
      !file.name.toLowerCase().endsWith(".heic") &&
      !file.type.includes("heic")
    ) {
      return file;
    }

    try {
      const jpegBlob = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.8,
      });

      return new File(
        [jpegBlob as Blob],
        file.name.replace(/\.heic$/i, ".jpg"),
        { type: "image/jpeg" },
      );
    } catch (error) {
      console.warn("HEIC conversion failed, using original file:", error);
      return file;
    }
  }, []);

  const handleUploadBegin = useCallback(
    (position: PhotoPosition) => () => {
      setUploading(position);
    },
    [],
  );

  const removePhoto = (position: PhotoPosition) => {
    setPhotos((prev) => ({
      ...prev,
      [position]: null,
    }));
  };

  const allPhotosUploaded = photos.front && photos.side && photos.back;

  const handleConfirmPhotos = () => {
    if (!allPhotosUploaded) {
      onError("Please upload all three photos: Front, Side, and Back");
      return;
    }

    onPhotosAssigned({
      frontPhotoUrl: photos.front!,
      sidePhotoUrl: photos.side!,
      backPhotoUrl: photos.back!,
    });
  };

  const photoInputs = [
    { position: "front" as PhotoPosition, label: "Front Photo" },
    { position: "side" as PhotoPosition, label: "Side Photo" },
    { position: "back" as PhotoPosition, label: "Back Photo" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="mb-1 text-sm font-medium text-zinc-900">
          Upload Your Progress Photos
        </h3>
        <p className="text-xs text-zinc-500">Take photos from three angles</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {photoInputs.map(({ position, label }) => (
          <div key={position} className="space-y-3">
            <div className="text-center">
              <h4 className="text-sm font-medium text-zinc-900">{label}</h4>
            </div>

            {photos[position] ? (
              <div className="space-y-2">
                <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-zinc-100">
                  <img
                    src={photos[position]!}
                    alt={label}
                    className="h-full w-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removePhoto(position)}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-600 transition-colors hover:bg-zinc-50"
                >
                  Replace Photo
                </button>
              </div>
            ) : (
              <UploadDropzone
                endpoint="imageUploader"
                onUploadBegin={handleUploadBegin(position)}
                onClientUploadComplete={(res) =>
                  handleUploadComplete(position)(res, [])
                }
                onUploadError={handleUploadError}
                config={{
                  mode: "auto",
                  onBeforeUploadBegin: async (files) => {
                    // Convert HEIC files to JPEG before upload
                    const convertedFiles = await Promise.all(
                      files.map((file) => convertHeicToJpeg(file)),
                    );
                    return convertedFiles;
                  },
                }}
                appearance={{
                  container:
                    "border-2 border-dashed border-zinc-300 rounded-lg p-6 bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer",
                  uploadIcon: "text-zinc-400 w-8 h-8",
                  label: "text-zinc-600 text-sm",
                  allowedContent: "text-zinc-400 text-xs",
                  button:
                    "bg-zinc-900 text-white px-3 py-2 rounded text-sm font-medium hover:bg-zinc-800 ut-uploading:bg-zinc-500",
                }}
                content={{
                  label:
                    uploading === position ? "Uploading..." : "Upload photo",
                  allowedContent: "Up to 8MB • HEIC supported",
                }}
              />
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleConfirmPhotos}
        disabled={!allPhotosUploaded}
        className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
      >
        {allPhotosUploaded
          ? "Continue to Details"
          : "Upload all photos to continue"}
      </button>
    </div>
  );
}
