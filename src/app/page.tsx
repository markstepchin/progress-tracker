"use client";

import Link from "next/link";
import { api } from "~/trpc/react";
import { HeroTransformationCard } from "~/components/HeroTransformationCard";
import { JourneyLine } from "~/components/JourneyLine";

function HeroSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-zinc-200 bg-white p-6">
      <div className="mx-auto mb-4 h-4 w-32 rounded bg-zinc-200" />
      <div className="flex items-center justify-center gap-3">
        <div className="text-center">
          <div className="mb-2 aspect-3/4 w-28 rounded-xl bg-zinc-200 sm:w-32" />
          <div className="mx-auto h-4 w-20 rounded bg-zinc-200" />
          <div className="mx-auto mt-1 h-3 w-16 rounded bg-zinc-200" />
        </div>
        <div className="px-2">
          <div className="h-6 w-6 rounded bg-zinc-200" />
        </div>
        <div className="text-center">
          <div className="mb-2 aspect-3/4 w-28 rounded-xl bg-zinc-200 sm:w-32" />
          <div className="mx-auto h-4 w-20 rounded bg-zinc-200" />
          <div className="mx-auto mt-1 h-3 w-16 rounded bg-zinc-200" />
        </div>
      </div>
      <div className="mt-5 flex justify-center gap-4">
        <div className="h-8 w-24 rounded-full bg-zinc-200" />
        <div className="h-8 w-20 rounded-full bg-zinc-200" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const { data: checkIns, isLoading, error } = api.checkIn.getAll.useQuery();
  const { data: milestones } = api.checkIn.getMilestones.useQuery();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Progress</h1>
          <p className="text-sm text-zinc-500">Track your transformation</p>
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
      {isLoading && <HeroSkeleton />}

      {/* Hero transformation card */}
      {!isLoading && !error && checkIns && (
        <HeroTransformationCard checkIns={checkIns} />
      )}

      {/* Journey timeline */}
      {!isLoading && !error && checkIns && milestones && milestones.length >= 2 && (
        <JourneyLine checkIns={checkIns} milestones={milestones} />
      )}

      {/* View all check-ins link */}
      {!isLoading && !error && checkIns && checkIns.length > 0 && (
        <div className="text-center">
          <Link
            href="/check-ins"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
          >
            View all check-ins
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
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}
