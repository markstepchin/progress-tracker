"use client";

import { formatDate, formatWeight } from "~/utils/formatters";
import type { RouterOutputs } from "~/trpc/react";

type CheckIn = RouterOutputs["checkIn"]["getAll"][number];

interface CheckInSelectProps {
  checkIns: CheckIn[];
  value: string;
  onChange: (value: string | null) => void;
  className?: string;
}

export function CheckInSelect({
  checkIns,
  value,
  onChange,
  className = "",
}: CheckInSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value || null)}
      className={`min-w-0 flex-1 appearance-none rounded-lg border border-zinc-200 bg-white bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-size-[1.25rem_1.25rem] bg-position-[right_0.75rem_center] bg-no-repeat px-3 pr-10 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 focus:outline-none ${className}`}
    >
      <option value="">Select check-in</option>
      {checkIns.map((c) => (
        <option key={c.id} value={c.id}>
          {formatDate(c.date)} - {formatWeight(c.weight)}
        </option>
      ))}
    </select>
  );
}
