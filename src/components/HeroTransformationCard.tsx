"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { differenceInWeeks } from "date-fns";
import { formatDate, formatWeight } from "~/utils/formatters";
import { ComparePhotoModal } from "./ComparePhotoModal";
import type { CompareSlide } from "./ComparePhotoModal";
import type { RouterOutputs } from "~/trpc/react";

type CheckIn = RouterOutputs["checkIn"]["getAll"][number];

interface HeroTransformationCardProps {
  checkIns: CheckIn[];
}

export function HeroTransformationCard({ checkIns }: HeroTransformationCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  if (checkIns.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
          <svg
            className="h-8 w-8 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
            />
          </svg>
        </div>
        <h2 className="mb-2 text-lg font-semibold text-zinc-900">
          Start Your Journey
        </h2>
        <p className="mb-6 text-sm text-zinc-500">
          Create your first check-in to begin tracking your transformation.
        </p>
        <Link
          href="/new-check-in"
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Create First Check-In
        </Link>
      </div>
    );
  }

  if (checkIns.length === 1) {
    const checkIn = checkIns[0]!;
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <p className="mb-4 text-center text-sm font-medium text-zinc-500">
          YOUR PROGRESS
        </p>
        <div className="flex justify-center">
          <div className="text-center">
            <div className="relative mx-auto mb-3 aspect-3/4 w-32 overflow-hidden rounded-xl bg-zinc-100">
              {checkIn.frontPhoto.url.includes("ufs.sh") ? (
                <img
                  src={checkIn.frontPhoto.url}
                  alt="Front"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Image
                  src={checkIn.frontPhoto.url}
                  alt="Front"
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              )}
            </div>
            <p className="text-sm font-medium text-zinc-900">
              {formatDate(checkIn.date)}
            </p>
            <p className="text-sm text-zinc-500">{formatWeight(checkIn.weight)}</p>
          </div>
        </div>
        <div className="mt-6 rounded-lg bg-zinc-50 p-4 text-center">
          <p className="text-sm text-zinc-600">
            Add another check-in to see your transformation
          </p>
          <Link
            href="/new-check-in"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-900 hover:underline"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Add Check-In
          </Link>
        </div>
      </div>
    );
  }

  const firstCheckIn = checkIns[checkIns.length - 1]!;
  const latestCheckIn = checkIns[0]!;
  const weeks = differenceInWeeks(latestCheckIn.date, firstCheckIn.date);
  const hasWeightData = firstCheckIn.weight !== null && latestCheckIn.weight !== null;
  const weightChange = hasWeightData
    ? latestCheckIn.weight! - firstCheckIn.weight!
    : 0;

  const compareSlides: CompareSlide[] = [
    {
      label: "Front",
      leftImage: firstCheckIn.frontPhoto,
      rightImage: latestCheckIn.frontPhoto,
    },
    {
      label: "Side",
      leftImage: firstCheckIn.sidePhoto,
      rightImage: latestCheckIn.sidePhoto,
    },
    {
      label: "Back",
      leftImage: firstCheckIn.backPhoto,
      rightImage: latestCheckIn.backPhoto,
    },
  ];

  const openModal = () => {
    setModalIndex(0);
    setModalOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="w-full rounded-2xl border border-zinc-200 bg-white p-6 text-left transition-all hover:border-zinc-300 hover:shadow-md active:scale-[0.99]"
      >
        <p className="mb-4 text-center text-sm font-medium text-zinc-500">
          YOUR TRANSFORMATION
        </p>

        <div className="flex items-center justify-center gap-3">
          {/* First check-in */}
          <div className="text-center">
            <div className="relative mb-2 aspect-3/4 w-28 overflow-hidden rounded-xl bg-zinc-100 sm:w-32">
              {firstCheckIn.frontPhoto.url.includes("ufs.sh") ? (
                <img
                  src={firstCheckIn.frontPhoto.url}
                  alt="First check-in"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Image
                  src={firstCheckIn.frontPhoto.url}
                  alt="First check-in"
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              )}
            </div>
            <p className="text-sm font-medium text-zinc-900">
              {formatDate(firstCheckIn.date)}
            </p>
            <p className="text-sm text-zinc-500">
              {formatWeight(firstCheckIn.weight)}
            </p>
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center px-2">
            <svg
              className="h-6 w-6 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </div>

          {/* Latest check-in */}
          <div className="text-center">
            <div className="relative mb-2 aspect-3/4 w-28 overflow-hidden rounded-xl bg-zinc-100 sm:w-32">
              {latestCheckIn.frontPhoto.url.includes("ufs.sh") ? (
                <img
                  src={latestCheckIn.frontPhoto.url}
                  alt="Latest check-in"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Image
                  src={latestCheckIn.frontPhoto.url}
                  alt="Latest check-in"
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              )}
            </div>
            <p className="text-sm font-medium text-zinc-900">
              {formatDate(latestCheckIn.date)}
            </p>
            <p className="text-sm text-zinc-500">
              {formatWeight(latestCheckIn.weight)}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-5 flex items-center justify-center gap-4">
          {hasWeightData && (
            <div
              className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                weightChange < 0
                  ? "bg-green-100 text-green-700"
                  : weightChange > 0
                    ? "bg-red-100 text-red-700"
                    : "bg-zinc-100 text-zinc-700"
              }`}
            >
              {weightChange < 0 ? "" : "+"}
              {weightChange.toFixed(1)} lbs
            </div>
          )}
          <div className="rounded-full bg-zinc-100 px-4 py-1.5 text-sm font-medium text-zinc-700">
            {weeks === 0 ? "< 1 week" : weeks === 1 ? "1 week" : `${weeks} weeks`}
          </div>
        </div>

        {/* CTA hint */}
        <p className="mt-4 text-center text-xs text-zinc-400">
          Tap to compare in detail
        </p>
      </button>

      {modalOpen && (
        <ComparePhotoModal
          slides={compareSlides}
          currentIndex={modalIndex}
          leftLabel={formatDate(firstCheckIn.date)}
          rightLabel={formatDate(latestCheckIn.date)}
          leftWeight={formatWeight(firstCheckIn.weight)}
          rightWeight={formatWeight(latestCheckIn.weight)}
          onClose={() => setModalOpen(false)}
          onNavigate={setModalIndex}
        />
      )}
    </>
  );
}
