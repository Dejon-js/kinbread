import { describe, it, expect } from 'vitest';
import { capacityWindowSchema } from './capacity-window';

describe('capacityWindowSchema', () => {
  it('validates correct input', () => {
    const result = capacityWindowSchema.safeParse({
      date: '2024-01-15',
      total_slots: 5,
      note: 'Weekend capacity',
    });
    expect(result.success).toBe(true);
  });

  it('validates input without note', () => {
    const result = capacityWindowSchema.safeParse({
      date: '2024-01-15',
      total_slots: 5,
    });
    expect(result.success).toBe(true);
  });

  it('allows zero slots', () => {
    const result = capacityWindowSchema.safeParse({
      date: '2024-01-15',
      total_slots: 0,
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative slots', () => {
    const result = capacityWindowSchema.safeParse({
      date: '2024-01-15',
      total_slots: -1,
    });
    expect(result.success).toBe(false);
  });

  it('rejects slots greater than 1000', () => {
    const result = capacityWindowSchema.safeParse({
      date: '2024-01-15',
      total_slots: 1001,
    });
    expect(result.success).toBe(false);
  });

  it('allows exactly 1000 slots', () => {
    const result = capacityWindowSchema.safeParse({
      date: '2024-01-15',
      total_slots: 1000,
    });
    expect(result.success).toBe(true);
  });

  it('rejects non-integer slots', () => {
    const result = capacityWindowSchema.safeParse({
      date: '2024-01-15',
      total_slots: 5.5,
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid date format', () => {
    expect(capacityWindowSchema.safeParse({
      date: '01-15-2024',
      total_slots: 5,
    }).success).toBe(false);

    expect(capacityWindowSchema.safeParse({
      date: '2024/01/15',
      total_slots: 5,
    }).success).toBe(false);

    expect(capacityWindowSchema.safeParse({
      date: 'January 15, 2024',
      total_slots: 5,
    }).success).toBe(false);
  });

  it('accepts valid YYYY-MM-DD format', () => {
    expect(capacityWindowSchema.safeParse({
      date: '2024-01-15',
      total_slots: 5,
    }).success).toBe(true);

    expect(capacityWindowSchema.safeParse({
      date: '2024-12-31',
      total_slots: 5,
    }).success).toBe(true);
  });

  it('allows null note', () => {
    const result = capacityWindowSchema.safeParse({
      date: '2024-01-15',
      total_slots: 5,
      note: null,
    });
    expect(result.success).toBe(true);
  });

  it('rejects note longer than 200 characters', () => {
    const result = capacityWindowSchema.safeParse({
      date: '2024-01-15',
      total_slots: 5,
      note: 'a'.repeat(201),
    });
    expect(result.success).toBe(false);
  });
});
