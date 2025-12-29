import Link from "next/link";
import { CreateCheckInForm } from "~/components/CreateCheckInForm";

export default function NewCheckInPage() {
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

        <div>
          <h1 className="text-xl font-bold text-zinc-900">New Check-In</h1>
          <p className="text-sm text-zinc-500">Add your progress photos</p>
        </div>
      </div>

      {/* Form */}
      <CreateCheckInForm />
    </div>
  );
}
