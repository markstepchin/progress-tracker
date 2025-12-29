"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PhotoUploadFlow } from "./PhotoUploadFlow";
import { formatDateForInput } from "~/utils/formatters";
import { api } from "~/trpc/react";

interface PhotoAssignment {
  frontPhotoUrl: string;
  sidePhotoUrl: string;
  backPhotoUrl: string;
}

export function CreateCheckInForm() {
  const router = useRouter();
  const [step, setStep] = useState<"upload" | "details">("upload");
  const [photos, setPhotos] = useState<PhotoAssignment | null>(null);
  const [date, setDate] = useState(formatDateForInput(new Date()));
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const utils = api.useUtils();
  const createMutation = api.checkIn.create.useMutation({
    onSuccess: (data) => {
      void utils.checkIn.getAll.invalidate();
      router.push(`/check-in/${data.id}`);
    },
    onError: (err) => {
      setError(err.message || "Failed to create check-in");
    },
  });

  const handlePhotosAssigned = (assignedPhotos: PhotoAssignment) => {
    setPhotos(assignedPhotos);
    setStep("details");
    setError(null);
  };

  const handlePhotoError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!photos) {
      setError("Please upload and assign photos first");
      return;
    }

    const parsedWeight = weight ? parseFloat(weight) : undefined;
    if (weight && (isNaN(parsedWeight!) || parsedWeight! <= 0)) {
      setError("Please enter a valid weight");
      return;
    }

    try {
      await createMutation.mutateAsync({
        date: new Date(date),
        weight: parsedWeight,
        notes: notes || undefined,
        frontPhotoUrl: photos.frontPhotoUrl,
        sidePhotoUrl: photos.sidePhotoUrl,
        backPhotoUrl: photos.backPhotoUrl,
      });
    } catch {
      // Error handled by mutation onError
    }
  };

  const goBackToUpload = () => {
    setStep("upload");
    setPhotos(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {step === "upload" && (
        <PhotoUploadFlow
          onPhotosAssigned={handlePhotosAssigned}
          onError={handlePhotoError}
        />
      )}

      {step === "details" && photos && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-zinc-900">Photos</h3>
              <button
                type="button"
                onClick={goBackToUpload}
                className="text-xs text-zinc-500 hover:text-zinc-700"
              >
                Change photos
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { url: photos.frontPhotoUrl, label: "Front" },
                { url: photos.sidePhotoUrl, label: "Side" },
                { url: photos.backPhotoUrl, label: "Back" },
              ].map((photo) => (
                <div
                  key={photo.label}
                  className="relative aspect-[4/5] overflow-hidden rounded-lg bg-zinc-100"
                >
                  <img
                    src={photo.url}
                    alt={photo.label}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1.5 py-0.5 text-xs font-medium text-white">
                    {photo.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Date field */}
          <div className="space-y-2">
            <label
              htmlFor="date"
              className="block text-sm font-medium text-zinc-900"
            >
              Date
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 focus:outline-none"
            />
          </div>

          {/* Weight field */}
          <div className="space-y-2">
            <label
              htmlFor="weight"
              className="block text-sm font-medium text-zinc-900"
            >
              Weight (lbs)
              <span className="ml-1 font-normal text-zinc-500">- optional</span>
            </label>
            <input
              type="number"
              id="weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g., 175.5"
              step="0.1"
              min="0"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 focus:outline-none"
            />
          </div>

          {/* Notes field */}
          <div className="space-y-2">
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-zinc-900"
            >
              Notes
              <span className="ml-1 font-normal text-zinc-500">- optional</span>
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How are you feeling? Any observations?"
              rows={3}
              className="w-full resize-none rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 focus:outline-none"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:bg-zinc-400"
          >
            {createMutation.isPending ? "Creating..." : "Create Check-In"}
          </button>
        </form>
      )}
    </div>
  );
}
