"use client";

import { useMemo } from "react";
import Image from "next/image";
import { formatDate, formatWeight } from "~/utils/formatters";

interface CheckIn {
  id: string;
  date: Date;
  weight: number | null;
}

interface Milestone extends CheckIn {
  label: string;
  frontPhoto: { url: string };
}

interface JourneyLineProps {
  checkIns: CheckIn[];
  milestones: Milestone[];
}

export function JourneyLine({ checkIns, milestones }: JourneyLineProps) {
  const chartData = useMemo(() => {
    const withWeight = checkIns
      .filter((c) => c.weight !== null)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (withWeight.length < 2) return null;

    const dates = withWeight.map((c) => new Date(c.date).getTime());
    const weights = withWeight.map((c) => c.weight!);
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const dateRange = maxDate - minDate;
    const weightRange = maxWeight - minWeight || 1;

    const padding = 16;
    const width = 100;
    const height = 32;

    const points = withWeight.map((c) => {
      const x =
        padding +
        ((new Date(c.date).getTime() - minDate) / dateRange) *
          (width - padding * 2);
      const y =
        height -
        4 -
        ((c.weight! - minWeight) / weightRange) * (height - 8);
      return { x, y, id: c.id };
    });

    const pathD = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ");

    const milestoneWeights = milestones
      .filter((m) => m.weight !== null)
      .map((m) => m.weight!);
    const highestMilestoneWeight = Math.max(...milestoneWeights);

    const milestonePoints = milestones
      .filter((m) => m.weight !== null)
      .map((m) => {
        const xPercent =
          (padding / width) * 100 +
          ((new Date(m.date).getTime() - minDate) / dateRange) *
            ((width - padding * 2) / width) *
            100;
        const yPercent =
          ((height - 4 - ((m.weight! - minWeight) / weightRange) * (height - 8)) /
            height) *
          100;
        const isHighest = m.weight === highestMilestoneWeight;
        return { ...m, xPercent, yPercent, isHighest };
      });

    return { pathD, milestonePoints, width, height };
  }, [checkIns, milestones]);

  if (!chartData) {
    return null;
  }

  const aboveBlobs = chartData.milestonePoints.filter((m) => m.isHighest);
  const belowBlobs = chartData.milestonePoints.filter((m) => !m.isHighest);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <p className="mb-2 text-center text-xs font-medium tracking-wide text-zinc-500">
        YOUR JOURNEY
      </p>

      <div className="relative">
        {/* Blobs above chart */}
        {aboveBlobs.length > 0 && (
          <div className="relative mb-2 h-24">
            {aboveBlobs.map((m) => (
              <div
                key={m.id}
                className="absolute bottom-0 -translate-x-1/2"
                style={{ left: `${m.xPercent}%` }}
              >
                <MilestoneBlob milestone={m} />
              </div>
            ))}
          </div>
        )}

        {/* Chart line */}
        <div className="relative h-8">
          <svg
            viewBox={`0 0 ${chartData.width} ${chartData.height}`}
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="none"
          >
            <path
              d={chartData.pathD}
              fill="none"
              stroke="#d4d4d8"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* Milestone dots */}
          {chartData.milestonePoints.map((m) => (
            <div
              key={m.id}
              className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-900"
              style={{
                left: `${m.xPercent}%`,
                top: `${m.yPercent}%`,
              }}
            />
          ))}
        </div>

        {/* Blobs below chart */}
        {belowBlobs.length > 0 && (
          <div className="relative mt-2 h-24">
            {belowBlobs.map((m) => (
              <div
                key={m.id}
                className="absolute top-0 -translate-x-1/2"
                style={{ left: `${m.xPercent}%` }}
              >
                <MilestoneBlob milestone={m} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MilestoneBlob({ milestone }: { milestone: Milestone & { isHighest: boolean } }) {
  return (
    <div className="flex w-20 flex-col items-center gap-1 rounded-lg bg-zinc-50 p-1.5">
      <div className="relative h-10 w-8 shrink-0 overflow-hidden rounded bg-zinc-200">
        {milestone.frontPhoto.url.includes("ufs.sh") ? (
          <img
            src={milestone.frontPhoto.url}
            alt={milestone.label}
            className="h-full w-full object-cover"
          />
        ) : (
          <Image
            src={milestone.frontPhoto.url}
            alt={milestone.label}
            fill
            className="object-cover"
            sizes="32px"
          />
        )}
      </div>
      <div className="w-full text-center">
        <p className="truncate text-xs font-medium text-zinc-900">{milestone.label}</p>
        <p className="text-xs text-zinc-500">{formatWeight(milestone.weight)}</p>
      </div>
    </div>
  );
}
