"use client";

import Link from "next/link";
import { api } from "~/trpc/react";
import { CheckInListItem } from "~/components/CheckInListItem";
import { CheckInListSkeleton } from "~/components/LoadingSkeleton";
import { EmptyState } from "~/components/EmptyState";

export default function CheckInsPage() {
  const { data: checkIns, isLoading, error } = api.checkIn.getAll.useQuery();

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

        <div className="flex-1">
          <h1 className="text-xl font-bold text-zinc-900">Check-Ins</h1>
          <p className="text-sm text-zinc-500">Your progress history</p>
        </div>

        <Link
          href="/new-check-in"
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 active:scale-95"
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
          New
        </Link>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          Failed to load check-ins. Please try again.
        </div>
      )}

      {/* Loading state */}
      {isLoading && <CheckInListSkeleton />}

      {/* Empty state */}
      {!isLoading && !error && checkIns?.length === 0 && <EmptyState />}

      {/* Check-in list */}
      {!isLoading && !error && checkIns && checkIns.length > 0 && (
        <div className="space-y-3">
          {checkIns.map((checkIn) => (
            <CheckInListItem
              key={checkIn.id}
              id={checkIn.id}
              date={checkIn.date}
              weight={checkIn.weight}
              frontPhoto={checkIn.frontPhoto}
              sidePhoto={checkIn.sidePhoto}
              backPhoto={checkIn.backPhoto}
            />
          ))}
        </div>
      )}
    </div>
  );
}
