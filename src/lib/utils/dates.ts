/**
 * Date utility functions for timezone-aware date formatting
 */

const DEFAULT_TIMEZONE = 'America/New_York';

/**
 * Format a date string for display in the baker's timezone
 * @param dateString - ISO date string (YYYY-MM-DD)
 * @param timezone - IANA timezone string (e.g., 'America/New_York')
 * @param options - Intl.DateTimeFormat options
 */
export function formatDateInTimezone(
  dateString: string,
  timezone: string,
  options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string {
  // Parse the date string as a local date in the target timezone
  // Add T12:00:00 to avoid timezone edge cases at midnight
  const date = new Date(`${dateString}T12:00:00`);

  return new Intl.DateTimeFormat('en-US', {
    ...options,
    timeZone: timezone,
  }).format(date);
}

/**
 * Format a date for display with weekday (e.g., "Monday, January 15, 2024")
 */
export function formatDate(dateString: string, timezone: string = DEFAULT_TIMEZONE): string {
  return formatDateInTimezone(dateString, timezone, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format a date for short display (e.g., "Mon, Dec 25")
 */
export function formatDateShort(dateString: string, timezone: string): string {
  return formatDateInTimezone(dateString, timezone, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a date for short display (e.g., "Jan 15")
 */
export function formatShortDate(dateString: string, timezone: string = DEFAULT_TIMEZONE): string {
  return formatDateInTimezone(dateString, timezone, {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a date for medium display (e.g., "December 25, 2024")
 */
export function formatDateMedium(dateString: string, timezone: string): string {
  return formatDateInTimezone(dateString, timezone, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get just the weekday name for a date
 */
export function formatWeekday(dateString: string, timezone: string = DEFAULT_TIMEZONE): string {
  return formatDateInTimezone(dateString, timezone, {
    weekday: 'long',
  });
}

/**
 * Get the current date in a specific timezone as YYYY-MM-DD
 */
export function getTodayInTimezone(timezone: string): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(now);
}

/**
 * Get today's date as YYYY-MM-DD string
 */
export function getTodayString(timezone: string = DEFAULT_TIMEZONE): string {
  return getTodayInTimezone(timezone);
}

/**
 * Check if a date is in the past relative to a timezone
 */
export function isDateInPast(dateString: string, timezone: string): boolean {
  const today = getTodayInTimezone(timezone);
  return dateString < today;
}

/**
 * Check if a date is today in a specific timezone
 */
export function isDateToday(dateString: string, timezone: string): boolean {
  const today = getTodayInTimezone(timezone);
  return dateString === today;
}

/**
 * Check if a date is today (alias for isDateToday)
 */
export function isToday(dateString: string, timezone: string = DEFAULT_TIMEZONE): boolean {
  return isDateToday(dateString, timezone);
}

/**
 * Format a timestamp (with time) for display
 */
export function formatTimestamp(timestamp: string, timezone: string = DEFAULT_TIMEZONE): string {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

/**
 * Common US timezones for selection
 */
export const US_TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
] as const;

/**
 * Timezone options for selection (alias for US_TIMEZONES)
 */
export const TIMEZONE_OPTIONS = US_TIMEZONES;
