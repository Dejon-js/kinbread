import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatDateInTimezone,
  formatDateShort,
  formatDateMedium,
  getTodayInTimezone,
  isDateInPast,
  isDateToday,
  US_TIMEZONES,
} from '@/lib/utils/dates';

describe('formatDateInTimezone', () => {
  it('should format date with default options', () => {
    const result = formatDateInTimezone('2024-12-25', 'America/New_York');
    expect(result).toContain('December');
    expect(result).toContain('25');
    expect(result).toContain('2024');
  });

  it('should format date with custom options', () => {
    const result = formatDateInTimezone('2024-12-25', 'America/New_York', {
      month: 'short',
      day: 'numeric',
    });
    expect(result).toContain('Dec');
    expect(result).toContain('25');
  });

  it('should respect different timezones', () => {
    // Both should work without throwing
    const nyResult = formatDateInTimezone('2024-12-25', 'America/New_York');
    const laResult = formatDateInTimezone('2024-12-25', 'America/Los_Angeles');
    expect(nyResult).toBeTruthy();
    expect(laResult).toBeTruthy();
  });
});

describe('formatDateShort', () => {
  it('should format date in short format', () => {
    const result = formatDateShort('2024-12-25', 'America/New_York');
    expect(result).toContain('Dec');
    expect(result).toContain('25');
  });
});

describe('formatDateMedium', () => {
  it('should format date in medium format', () => {
    const result = formatDateMedium('2024-12-25', 'America/New_York');
    expect(result).toContain('December');
    expect(result).toContain('25');
    expect(result).toContain('2024');
  });
});

describe('getTodayInTimezone', () => {
  it('should return date in YYYY-MM-DD format', () => {
    const result = getTodayInTimezone('America/New_York');
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should return valid date components', () => {
    const result = getTodayInTimezone('America/New_York');
    const [year, month, day] = result.split('-').map(Number);
    expect(year).toBeGreaterThanOrEqual(2024);
    expect(month).toBeGreaterThanOrEqual(1);
    expect(month).toBeLessThanOrEqual(12);
    expect(day).toBeGreaterThanOrEqual(1);
    expect(day).toBeLessThanOrEqual(31);
  });
});

describe('isDateInPast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return true for past dates', () => {
    const result = isDateInPast('2024-06-14', 'America/New_York');
    expect(result).toBe(true);
  });

  it('should return false for future dates', () => {
    const result = isDateInPast('2024-06-16', 'America/New_York');
    expect(result).toBe(false);
  });

  it('should return false for today', () => {
    const result = isDateInPast('2024-06-15', 'America/New_York');
    expect(result).toBe(false);
  });
});

describe('isDateToday', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return true for today', () => {
    const result = isDateToday('2024-06-15', 'America/New_York');
    expect(result).toBe(true);
  });

  it('should return false for yesterday', () => {
    const result = isDateToday('2024-06-14', 'America/New_York');
    expect(result).toBe(false);
  });

  it('should return false for tomorrow', () => {
    const result = isDateToday('2024-06-16', 'America/New_York');
    expect(result).toBe(false);
  });
});

describe('US_TIMEZONES', () => {
  it('should contain common US timezones', () => {
    const timezoneValues = US_TIMEZONES.map((tz) => tz.value);
    expect(timezoneValues).toContain('America/New_York');
    expect(timezoneValues).toContain('America/Chicago');
    expect(timezoneValues).toContain('America/Denver');
    expect(timezoneValues).toContain('America/Los_Angeles');
  });

  it('should have value and label for each timezone', () => {
    US_TIMEZONES.forEach((tz) => {
      expect(tz.value).toBeTruthy();
      expect(tz.label).toBeTruthy();
    });
  });
});
