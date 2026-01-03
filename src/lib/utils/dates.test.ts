import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatDate,
  formatShortDate,
  formatWeekday,
  getTodayString,
  isDateInPast,
  isToday,
  formatTimestamp,
  TIMEZONE_OPTIONS,
} from './dates';

describe('dates utility functions', () => {
  describe('formatDate', () => {
    it('formats a date string correctly', () => {
      const result = formatDate('2024-01-15', 'America/New_York');
      expect(result).toContain('January');
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });

    it('includes the weekday in the formatted date', () => {
      // January 15, 2024 is a Monday
      const result = formatDate('2024-01-15', 'America/New_York');
      expect(result).toContain('Monday');
    });

    it('uses default timezone when not provided', () => {
      const result = formatDate('2024-01-15');
      expect(result).toBeTruthy();
      expect(result).toContain('January');
    });
  });

  describe('formatShortDate', () => {
    it('formats date as short format (e.g., "Jan 15")', () => {
      const result = formatShortDate('2024-01-15', 'America/New_York');
      expect(result).toMatch(/Jan\s+15/);
    });

    it('handles different months correctly', () => {
      expect(formatShortDate('2024-12-25', 'America/New_York')).toMatch(/Dec\s+25/);
      expect(formatShortDate('2024-07-04', 'America/New_York')).toMatch(/Jul\s+4/);
    });
  });

  describe('formatWeekday', () => {
    it('returns the weekday name', () => {
      // January 15, 2024 is a Monday
      expect(formatWeekday('2024-01-15', 'America/New_York')).toBe('Monday');
      // January 16, 2024 is a Tuesday
      expect(formatWeekday('2024-01-16', 'America/New_York')).toBe('Tuesday');
    });
  });

  describe('getTodayString', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns date in YYYY-MM-DD format', () => {
      vi.setSystemTime(new Date('2024-03-15T12:00:00'));
      const result = getTodayString('America/New_York');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('isDateInPast', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-03-15T12:00:00'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns true for past dates', () => {
      expect(isDateInPast('2024-03-14', 'America/New_York')).toBe(true);
      expect(isDateInPast('2024-01-01', 'America/New_York')).toBe(true);
    });

    it('returns false for today', () => {
      expect(isDateInPast('2024-03-15', 'America/New_York')).toBe(false);
    });

    it('returns false for future dates', () => {
      expect(isDateInPast('2024-03-16', 'America/New_York')).toBe(false);
      expect(isDateInPast('2024-12-25', 'America/New_York')).toBe(false);
    });
  });

  describe('isToday', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-03-15T12:00:00'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns true for today', () => {
      expect(isToday('2024-03-15', 'America/New_York')).toBe(true);
    });

    it('returns false for other dates', () => {
      expect(isToday('2024-03-14', 'America/New_York')).toBe(false);
      expect(isToday('2024-03-16', 'America/New_York')).toBe(false);
    });
  });

  describe('formatTimestamp', () => {
    it('formats a timestamp correctly', () => {
      const result = formatTimestamp('2024-01-15T14:30:00Z', 'America/New_York');
      expect(result).toContain('Jan');
      expect(result).toContain('15');
    });

    it('includes time in the formatted output', () => {
      const result = formatTimestamp('2024-01-15T14:30:00Z', 'America/New_York');
      // Should contain hour and minute
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  describe('TIMEZONE_OPTIONS', () => {
    it('contains common US timezones', () => {
      const values = TIMEZONE_OPTIONS.map((tz) => tz.value);
      expect(values).toContain('America/New_York');
      expect(values).toContain('America/Chicago');
      expect(values).toContain('America/Denver');
      expect(values).toContain('America/Los_Angeles');
    });

    it('has labels for all options', () => {
      TIMEZONE_OPTIONS.forEach((tz) => {
        expect(tz.label).toBeTruthy();
        expect(tz.value).toBeTruthy();
      });
    });
  });
});
