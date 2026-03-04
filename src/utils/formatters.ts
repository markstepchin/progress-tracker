import { format, formatDistanceToNow } from "date-fns";

/**
 * Format a date for display in the UI
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "MMM d, yyyy");
}

/**
 * Format a date with day of week
 */
export function formatDateWithDay(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "EEEE, MMM d, yyyy");
}

/**
 * Format a date as relative time (e.g., "3 days ago")
 */
export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Format a date for input fields (YYYY-MM-DD)
 */
export function formatDateForInput(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "yyyy-MM-dd");
}

/**
 * Format weight for display (with consistent decimal places)
 */
export function formatWeight(weight: number | null | undefined): string {
  if (weight === null || weight === undefined) {
    return "—";
  }
  return `${weight.toFixed(1)} lbs`;
}

/**
 * Format weight change (with + or - sign)
 */
export function formatWeightChange(change: number): string {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(1)} lbs`;
}

/**
 * Format file size in bytes to human-readable string (e.g. "1.2 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
