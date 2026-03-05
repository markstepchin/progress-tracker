"use client";

import { heicTo } from "heic-to";
import Image from "next/image";
import { useState, useCallback } from "react";
import { UploadDropzone } from "~/utils/uploadthing";

/** Convert HEIC to JPEG using native browser decoding (img + canvas). Only succeeds in browsers that decode HEIC in img (e.g. Safari). Returns null otherwise. */
function convertHeicViaNativeDecode(file: File): Promise<Blob | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = document.createElement("img");

    const cleanup = () => {
      URL.revokeObjectURL(url);
      img.src = "";
    };

    const timeout = setTimeout(() => {
      cleanup();
      resolve(null);
    }, 15000);

    img.onload = () => {
      clearTimeout(timeout);
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          cleanup();
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            cleanup();
            resolve(blob ?? null);
          },
          "image/jpeg",
          0.8,
        );
      } catch {
        cleanup();
        resolve(null);
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      cleanup();
      resolve(null);
    };

    img.src = url;
  });
}

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

type ConversionMethod = "native" | "heic-to";

export function PhotoUploadFlow({
  onPhotosAssigned,
  onError,
}: PhotoUploadFlowProps) {
  const [photos, setPhotos] = useState<PhotoState>({
    front: null,
    side: null,
    back: null,
  });
  const [conversionMethod, setConversionMethod] = useState<{
    front: ConversionMethod | null;
    side: ConversionMethod | null;
    back: ConversionMethod | null;
  }>({ front: null, side: null, back: null });
  const [converting, setConverting] = useState<PhotoPosition | null>(null);
  const [uploading, setUploading] = useState<PhotoPosition | null>(null);

  const handleUploadComplete = useCallback(
    (position: PhotoPosition) => (res: { ufsUrl: string }[]) => {
      setUploading(null);
      if (res.length > 0) {
        setPhotos((prev) => ({ ...prev, [position]: res[0]?.ufsUrl }));
      }
    },
    [],
  );

  const handleUploadError = useCallback(
    (error: Error) => {
      setUploading(null);
      setConverting(null);
      onError(error.message || "Failed to upload photo");
    },
    [onError],
  );

  const convertHeicToJpeg = useCallback(
    async (
      file: File,
    ): Promise<{ file: File; method: ConversionMethod | null }> => {
      if (
        !file.name.toLowerCase().endsWith(".heic") &&
        !file.type.includes("heic")
      ) {
        return { file, method: null };
      }

      const outName = file.name.replace(/\.heic$/i, ".jpg");

      const heicErrorMessage =
        "This HEIC photo couldn’t be converted. Try saving it as JPEG from the Photos app (Share → Save as JPEG) and upload again.";

      // 1. Try heic-to first (newer libheif, supports iOS 18 HEIC in all browsers)
      try {
        const jpegBlob = await heicTo({
          blob: file,
          type: "image/jpeg",
          quality: 0.8,
        });
        if (jpegBlob) {
          return {
            file: new File([jpegBlob], outName, { type: "image/jpeg" }),
            method: "heic-to",
          };
        }
      } catch {
        // heic-to failed
      }

      // 2. Try native browser HEIC decode (works in Safari)
      try {
        const blob = await convertHeicViaNativeDecode(file);
        if (blob) {
          return {
            file: new File([blob], outName, { type: "image/jpeg" }),
            method: "native",
          };
        }
      } catch {
        // Native path failed
      }

      onError(heicErrorMessage);
      throw new Error("HEIC conversion failed");
    },
    [onError],
  );

  const handleUploadBegin = useCallback(
    (position: PhotoPosition) => () => {
      setUploading(position);
    },
    [],
  );

  const removePhoto = (position: PhotoPosition) => {
    setPhotos((prev) => ({ ...prev, [position]: null }));
    setConversionMethod((prev) => ({ ...prev, [position]: null }));
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
                {conversionMethod[position] && (
                  <p className="text-xs text-zinc-500">
                    Converted with{" "}
                    {conversionMethod[position] === "native"
                      ? "Safari"
                      : "heic-to"}
                  </p>
                )}
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
                onBeforeUploadBegin={async (files) => {
                  setConverting(position);
                  try {
                    const results = await Promise.all(
                      files.map((file) => convertHeicToJpeg(file)),
                    );
                    const method = results[0]?.method ?? null;
                    if (method) {
                      setConversionMethod((prev) => ({ ...prev, [position]: method }));
                    }
                    return results.map((r) => r.file);
                  } catch {
                    setUploading(null);
                    return [];
                  } finally {
                    setConverting(null);
                  }
                }}
                onClientUploadComplete={(res) =>
                  handleUploadComplete(position)(res)
                }
                onUploadError={handleUploadError}
                config={{
                  mode: "auto",
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
                    converting === position
                      ? "Converting HEIC…"
                      : uploading === position
                        ? "Uploading..."
                        : "Upload photo",
                  allowedContent:
                    converting === position
                      ? "Converting to JPEG…"
                      : "Up to 8MB • HEIC supported",
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
