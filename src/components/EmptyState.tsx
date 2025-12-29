import Link from "next/link";

interface EmptyStateProps {
  title?: string;
  description?: string;
  showCreateButton?: boolean;
}

export function EmptyState({
  title = "No check-ins yet",
  description = "Start tracking your fitness progress by creating your first check-in.",
  showCreateButton = true,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
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

      <h3 className="mb-2 text-lg font-semibold text-zinc-900">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-zinc-500">{description}</p>

      {showCreateButton && (
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
          New Check-In
        </Link>
      )}
    </div>
  );
}
