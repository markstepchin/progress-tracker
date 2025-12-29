"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import { CheckInDetail } from "~/components/CheckInDetail";
import { CheckInDetailSkeleton } from "~/components/LoadingSkeleton";

export default function CheckInDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const {
    data: checkIn,
    isLoading,
    error,
  } = api.checkIn.getById.useQuery({ id });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
          aria-label="Go back"
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
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </Link>

        <h1 className="text-xl font-bold text-zinc-900">Check-In Details</h1>
      </div>

      {/* Loading state */}
      {isLoading && <CheckInDetailSkeleton />}

      {/* Error state */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          Failed to load check-in. Please try again.
        </div>
      )}

      {/* Not found state */}
      {!isLoading && !error && !checkIn && (
        <div className="py-16 text-center">
          <h2 className="mb-2 text-lg font-semibold text-zinc-900">
            Check-In Not Found
          </h2>
          <p className="mb-6 text-sm text-zinc-500">
            This check-in may have been deleted or doesn&apos;t exist.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            Back to Check-Ins
          </Link>
        </div>
      )}

      {/* Check-in detail */}
      {!isLoading && !error && checkIn && (
        <CheckInDetail
          id={checkIn.id}
          date={checkIn.date}
          weight={checkIn.weight}
          notes={checkIn.notes}
          frontPhoto={checkIn.frontPhoto}
          sidePhoto={checkIn.sidePhoto}
          backPhoto={checkIn.backPhoto}
        />
      )}
    </div>
  );
}
