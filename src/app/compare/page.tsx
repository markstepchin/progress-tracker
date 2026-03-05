"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useQueryState, parseAsString, parseAsFloat } from "nuqs";
import { api } from "~/trpc/react";
import { CompareView } from "~/components/CompareView";
import { CompareSkeleton } from "~/components/LoadingSkeleton";

function ComparePageContent() {
  const { data: checkIns, isLoading, error } = api.checkIn.getAll.useQuery();

  const [selectedA, setSelectedA] = useQueryState(
    "a",
    parseAsString.withDefault(""),
  );
  const [selectedB, setSelectedB] = useQueryState(
    "b",
    parseAsString.withDefault(""),
  );

  const [zoomA, setZoomA] = useQueryState("zA", parseAsFloat.withDefault(1));
  const [zoomB, setZoomB] = useQueryState("zB", parseAsFloat.withDefault(1));
  const [brightnessA, setBrightnessA] = useQueryState(
    "brA",
    parseAsFloat.withDefault(1),
  );
  const [brightnessB, setBrightnessB] = useQueryState(
    "brB",
    parseAsFloat.withDefault(1),
  );
  const [contrastA, setContrastA] = useQueryState(
    "coA",
    parseAsFloat.withDefault(1),
  );
  const [contrastB, setContrastB] = useQueryState(
    "coB",
    parseAsFloat.withDefault(1),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="rounded-full bg-gray-200 p-3 text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-600"
          aria-label="Go back"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="black"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </Link>

        <div>
          <h1 className="text-xl font-bold text-zinc-900">Compare Progress</h1>
          <p className="text-sm text-zinc-500">Side by side comparison</p>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && <CompareSkeleton />}

      {/* Error state */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          Failed to load check-ins. Please try again.
        </div>
      )}

      {/* Compare view */}
      {!isLoading && !error && checkIns && (
        <CompareView
          checkIns={checkIns}
          selectedA={selectedA}
          selectedB={selectedB}
          setSelectedA={setSelectedA}
          setSelectedB={setSelectedB}
          imageSettingsA={{ zoom: zoomA, brightness: brightnessA, contrast: contrastA }}
          imageSettingsB={{ zoom: zoomB, brightness: brightnessB, contrast: contrastB }}
          setImageSettingsA={{ setZoom: setZoomA, setBrightness: setBrightnessA, setContrast: setContrastA }}
          setImageSettingsB={{ setZoom: setZoomB, setBrightness: setBrightnessB, setContrast: setContrastB }}
        />
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<CompareSkeleton />}>
      <ComparePageContent />
    </Suspense>
  );
}
