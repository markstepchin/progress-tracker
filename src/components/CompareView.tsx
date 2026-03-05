"use client";

import Image from "next/image";
import { useState } from "react";
import { formatDate, formatWeight } from "~/utils/formatters";
import { ComparePhotoModal } from "./ComparePhotoModal";
import type { CompareSlide } from "./ComparePhotoModal";
import { EmptyState } from "./EmptyState";
import type { RouterOutputs } from "~/trpc/react";

type CheckIn = RouterOutputs["checkIn"]["getAll"][number];

interface CompareViewProps {
  checkIns: CheckIn[];
}

export function CompareView({ checkIns }: CompareViewProps) {
  const [selectedA, setSelectedA] = useState<string>("");
  const [selectedB, setSelectedB] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  const checkInA = checkIns.find((c) => c.id === selectedA);
  const checkInB = checkIns.find((c) => c.id === selectedB);

  if (checkIns.length === 0) {
    return (
      <EmptyState
        title="No check-ins to compare"
        description="Create at least two check-ins to compare your progress."
      />
    );
  }

  if (checkIns.length === 1) {
    return (
      <EmptyState
        title="Need more check-ins"
        description="Create at least one more check-in to start comparing your progress."
      />
    );
  }

  const openCompareModal = (viewIndex: number) => {
    if (!checkInA || !checkInB) return;
    setModalIndex(viewIndex);
    setModalOpen(true);
  };

  const compareSlides: CompareSlide[] =
    checkInA && checkInB
      ? [
          {
            label: "Front",
            leftSrc: checkInA.frontPhoto,
            rightSrc: checkInB.frontPhoto,
          },
          {
            label: "Side",
            leftSrc: checkInA.sidePhoto,
            rightSrc: checkInB.sidePhoto,
          },
          {
            label: "Back",
            leftSrc: checkInA.backPhoto,
            rightSrc: checkInB.backPhoto,
          },
        ]
      : [];

  const renderCheckInCard = (
    checkIn: CheckIn | undefined,
    label: string,
    selectedValue: string,
    onSelect: (id: string) => void,
  ) => (
    <div className="space-y-3">
      <div className="flex items-center">
        <span className="text-sm font-medium text-zinc-500">{label}</span>
        <select
          value={selectedValue}
          onChange={(e) => onSelect(e.target.value)}
          className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 focus:outline-none"
        >
          <option value="">Select check-in</option>
          {checkIns.map((c) => (
            <option key={c.id} value={c.id}>
              {formatDate(c.date)} - {formatWeight(c.weight)}
            </option>
          ))}
        </select>
      </div>

      {checkIn ? (
        <div>
          <div className="flex flex-col gap-2">
            {[
              { src: checkIn.frontPhoto, label: "Front" },
              { src: checkIn.sidePhoto, label: "Side" },
              { src: checkIn.backPhoto, label: "Back" },
            ].map((photo, index) => (
              <button
                key={photo.label}
                type="button"
                onClick={() =>
                  checkInA && checkInB ? openCompareModal(index) : undefined
                }
                disabled={!(checkInA && checkInB)}
                className="group relative aspect-[4/5] overflow-hidden rounded-lg bg-zinc-100 transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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
                    sizes="(max-width: 768px) 30vw, 150px"
                  />
                )}
                <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1.5 py-0.5 text-xs font-medium text-white">
                  {photo.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex aspect-[3/4] items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50">
          <span className="text-sm text-zinc-400">Select a check-in</span>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Weight difference */}
      {checkInA?.weight && checkInB?.weight && (
        <div className="rounded-lg bg-zinc-50 p-4 text-center">
          <span className="text-sm text-zinc-500">Weight Change</span>
          <p
            className={`text-xl font-bold ${
              checkInB.weight < checkInA.weight
                ? "text-green-600"
                : checkInB.weight > checkInA.weight
                  ? "text-red-600"
                  : "text-zinc-600"
            }`}
          >
            {checkInB.weight < checkInA.weight ? "" : "+"}
            {(checkInB.weight - checkInA.weight).toFixed(1)} lbs
          </p>
        </div>
      )}
      <div className="flex gap-1">
        {renderCheckInCard(checkInA, "", selectedA, setSelectedA)}

        {renderCheckInCard(checkInB, "", selectedB, setSelectedB)}
      </div>

      {modalOpen && checkInA && checkInB && (
        <ComparePhotoModal
          slides={compareSlides}
          currentIndex={modalIndex}
          leftLabel={formatDate(checkInA.date)}
          rightLabel={formatDate(checkInB.date)}
          onClose={() => setModalOpen(false)}
          onNavigate={setModalIndex}
        />
      )}
    </>
  );
}
