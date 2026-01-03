/**
 * Format a date string for display in a specific timezone
 */
export function formatDate(
  dateString: string,
  timezone: string = "America/New_York",
  options?: Intl.DateTimeFormatOptions
): string {
  const date = new Date(dateString + "T12:00:00"); // Add noon time to avoid timezone issues
  return date.toLocaleDateString("en-US", {
    timeZone: timezone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  });
}

/**
 * Format a date string as a short date (e.g., "Jan 15")
 */
export function formatShortDate(
  dateString: string,
  timezone: string = "America/New_York"
): string {
  const date = new Date(dateString + "T12:00:00");
  return date.toLocaleDateString("en-US", {
    timeZone: timezone,
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a date string as weekday (e.g., "Monday")
 */
export function formatWeekday(
  dateString: string,
  timezone: string = "America/New_York"
): string {
  const date = new Date(dateString + "T12:00:00");
  return date.toLocaleDateString("en-US", {
    timeZone: timezone,
    weekday: "long",
  });
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayString(timezone: string = "America/New_York"): string {
  const now = new Date();
  return now.toLocaleDateString("en-CA", { timeZone: timezone }); // en-CA gives YYYY-MM-DD format
}

/**
 * Check if a date string is in the past
 */
export function isDateInPast(
  dateString: string,
  timezone: string = "America/New_York"
): boolean {
  const today = getTodayString(timezone);
  return dateString < today;
}

/**
 * Check if a date string is today
 */
export function isToday(
  dateString: string,
  timezone: string = "America/New_York"
): boolean {
  const today = getTodayString(timezone);
  return dateString === today;
}

/**
 * Format a timestamp for display
 */
export function formatTimestamp(
  timestamp: string,
  timezone: string = "America/New_York"
): string {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    timeZone: timezone,
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Common timezone options for North America
 */
export const TIMEZONE_OPTIONS = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HT)" },
] as const;
