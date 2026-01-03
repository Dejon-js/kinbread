import { describe, it, expect } from 'vitest';
import { capacityWindowSchema, updateCapacityWindowSchema } from '@/lib/validations/capacity-window';

describe('capacityWindowSchema', () => {
  it('should validate valid capacity window data', () => {
    const result = capacityWindowSchema.safeParse({
      date: '2024-12-25',
      total_slots: 5,
      note: 'Christmas orders',
    });
    expect(result.success).toBe(true);
  });

  it('should accept 0 slots (blocks all bookings)', () => {
    const result = capacityWindowSchema.safeParse({
      date: '2024-12-25',
      total_slots: 0,
    });
    expect(result.success).toBe(true);
  });

  it('should accept null note', () => {
    const result = capacityWindowSchema.safeParse({
      date: '2024-12-25',
      total_slots: 5,
      note: null,
    });
    expect(result.success).toBe(true);
  });

  it('should transform empty note to null', () => {
    const result = capacityWindowSchema.safeParse({
      date: '2024-12-25',
      total_slots: 5,
      note: '',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.note).toBe(null);
    }
  });

  it('should reject invalid date format', () => {
    const result = capacityWindowSchema.safeParse({
      date: '12-25-2024',
      total_slots: 5,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Invalid date format (expected YYYY-MM-DD)');
    }
  });

  it('should reject invalid date format with slashes', () => {
    const result = capacityWindowSchema.safeParse({
      date: '2024/12/25',
      total_slots: 5,
    });
    expect(result.success).toBe(false);
  });

  it('should reject negative slots', () => {
    const result = capacityWindowSchema.safeParse({
      date: '2024-12-25',
      total_slots: -1,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Slots cannot be negative');
    }
  });

  it('should reject non-integer slots', () => {
    const result = capacityWindowSchema.safeParse({
      date: '2024-12-25',
      total_slots: 5.5,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Slots must be a whole number');
    }
  });

  it('should reject slots exceeding 1000', () => {
    const result = capacityWindowSchema.safeParse({
      date: '2024-12-25',
      total_slots: 1001,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Slots cannot exceed 1000');
    }
  });

  it('should reject note longer than 200 characters', () => {
    const result = capacityWindowSchema.safeParse({
      date: '2024-12-25',
      total_slots: 5,
      note: 'a'.repeat(201),
    });
    expect(result.success).toBe(false);
  });
});

describe('updateCapacityWindowSchema', () => {
  it('should validate valid update data with UUID', () => {
    const result = updateCapacityWindowSchema.safeParse({
      id: '123e4567-e89b-12d3-a456-426614174000',
      date: '2024-12-25',
      total_slots: 10,
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid UUID', () => {
    const result = updateCapacityWindowSchema.safeParse({
      id: 'not-a-uuid',
      date: '2024-12-25',
      total_slots: 10,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Invalid window ID');
    }
  });
});
