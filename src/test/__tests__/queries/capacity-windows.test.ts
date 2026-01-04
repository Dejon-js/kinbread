import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getWindowsForBaker,
  getWindowWithSubmissions,
  getPublicWindowsForBaker,
  getWindowForBooking,
  getWindowById,
  windowHasSubmissions,
  windowExistsForDate,
  getExistingDatesInRange,
} from '@/lib/queries/capacity-windows';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

const mockWindow = {
  id: 'window-123',
  baker_id: 'baker-123',
  date: '2025-01-15',
  total_slots: 10,
  note: 'Test note',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockSubmission = {
  id: 'sub-123',
  baker_id: 'baker-123',
  capacity_window_id: 'window-123',
  customer_name: 'John Doe',
  customer_email: 'john@example.com',
  customer_phone: '555-1234',
  description: 'Birthday cake',
  quantity: 1,
  budget_range: '$50-100',
  slots_consumed: 1,
  submitted_at: '2024-01-01T00:00:00Z',
};

describe('getWindowsForBaker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty array when no windows exist', async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await getWindowsForBaker('baker-123');

    expect(result).toEqual([]);
  });

  it('should return windows with calculated stats', async () => {
    const windowsChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [mockWindow], error: null }),
    };
    const submissionsChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: [{ capacity_window_id: 'window-123', slots_consumed: 3 }],
        error: null,
      }),
    };

    mockSupabase.from
      .mockReturnValueOnce(windowsChain)
      .mockReturnValueOnce(submissionsChain);

    const result = await getWindowsForBaker('baker-123');

    expect(result).toHaveLength(1);
    expect(result[0].used_slots).toBe(3);
    expect(result[0].available_slots).toBe(7);
  });

  it('should handle windows with no submissions', async () => {
    const windowsChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [mockWindow], error: null }),
    };
    const submissionsChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: [], error: null }),
    };

    mockSupabase.from
      .mockReturnValueOnce(windowsChain)
      .mockReturnValueOnce(submissionsChain);

    const result = await getWindowsForBaker('baker-123');

    expect(result[0].used_slots).toBe(0);
    expect(result[0].available_slots).toBe(10);
  });

  it('should throw error on database error', async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    await expect(getWindowsForBaker('baker-123')).rejects.toEqual({
      message: 'Database error',
    });
  });
});

describe('getWindowWithSubmissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null when window not found', async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows' },
      }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await getWindowWithSubmissions('window-123', 'baker-123');

    expect(result).toBeNull();
  });

  it('should return window with submissions and stats', async () => {
    const windowChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockWindow, error: null }),
    };
    const submissionsChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [mockSubmission],
        error: null,
      }),
    };

    mockSupabase.from
      .mockReturnValueOnce(windowChain)
      .mockReturnValueOnce(submissionsChain);

    const result = await getWindowWithSubmissions('window-123', 'baker-123');

    expect(result).not.toBeNull();
    expect(result!.submissions).toHaveLength(1);
    expect(result!.used_slots).toBe(1);
    expect(result!.available_slots).toBe(9);
  });

  it('should throw error for non-PGRST116 errors', async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST500', message: 'Database error' },
      }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    await expect(
      getWindowWithSubmissions('window-123', 'baker-123')
    ).rejects.toEqual({ code: 'PGRST500', message: 'Database error' });
  });
});

describe('getPublicWindowsForBaker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty array when no windows exist', async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await getPublicWindowsForBaker('baker-123');

    expect(result).toEqual([]);
  });

  it('should return public windows with availability info', async () => {
    const futureWindow = { id: 'window-123', date: '2099-01-15', total_slots: 5 };
    const windowsChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [futureWindow], error: null }),
    };
    const submissionsChain = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({
        data: [{ capacity_window_id: 'window-123', slots_consumed: 2 }],
        error: null,
      }),
    };

    mockSupabase.from
      .mockReturnValueOnce(windowsChain)
      .mockReturnValueOnce(submissionsChain);

    const result = await getPublicWindowsForBaker('baker-123');

    expect(result).toHaveLength(1);
    expect(result[0].available_slots).toBe(3);
    expect(result[0].is_available).toBe(true);
  });

  it('should mark sold out windows as unavailable', async () => {
    const futureWindow = { id: 'window-123', date: '2099-01-15', total_slots: 2 };
    const windowsChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [futureWindow], error: null }),
    };
    const submissionsChain = {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({
        data: [{ capacity_window_id: 'window-123', slots_consumed: 2 }],
        error: null,
      }),
    };

    mockSupabase.from
      .mockReturnValueOnce(windowsChain)
      .mockReturnValueOnce(submissionsChain);

    const result = await getPublicWindowsForBaker('baker-123');

    expect(result[0].available_slots).toBe(0);
    expect(result[0].is_available).toBe(false);
  });
});

describe('getWindowForBooking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null when window not found', async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows' },
      }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await getWindowForBooking('window-123', 'baker-123');

    expect(result).toBeNull();
  });

  it('should return unavailable for past dates', async () => {
    const pastWindow = { ...mockWindow, date: '2020-01-01' };
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: pastWindow, error: null }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await getWindowForBooking('window-123', 'baker-123');

    expect(result).not.toBeNull();
    expect(result!.available).toBe(false);
  });

  it('should return available when slots exist', async () => {
    const futureWindow = { ...mockWindow, date: '2099-01-15' };
    const windowChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: futureWindow, error: null }),
    };
    const submissionsChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: [{ slots_consumed: 3 }],
        error: null,
      }),
    };

    mockSupabase.from
      .mockReturnValueOnce(windowChain)
      .mockReturnValueOnce(submissionsChain);

    const result = await getWindowForBooking('window-123', 'baker-123');

    expect(result).not.toBeNull();
    expect(result!.available).toBe(true);
  });

  it('should return unavailable when fully booked', async () => {
    const futureWindow = { ...mockWindow, date: '2099-01-15', total_slots: 2 };
    const windowChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: futureWindow, error: null }),
    };
    const submissionsChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: [{ slots_consumed: 1 }, { slots_consumed: 1 }],
        error: null,
      }),
    };

    mockSupabase.from
      .mockReturnValueOnce(windowChain)
      .mockReturnValueOnce(submissionsChain);

    const result = await getWindowForBooking('window-123', 'baker-123');

    expect(result).not.toBeNull();
    expect(result!.available).toBe(false);
  });
});

describe('getWindowById', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return window when found', async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockWindow, error: null }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await getWindowById('window-123');

    expect(result).toEqual(mockWindow);
  });

  it('should return null when window not found', async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows' },
      }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await getWindowById('nonexistent');

    expect(result).toBeNull();
  });

  it('should throw error for other database errors', async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST500', message: 'Database error' },
      }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    await expect(getWindowById('window-123')).rejects.toEqual({
      code: 'PGRST500',
      message: 'Database error',
    });
  });
});

describe('windowHasSubmissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return true when window has submissions', async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ count: 3, error: null }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await windowHasSubmissions('window-123');

    expect(result).toBe(true);
  });

  it('should return false when window has no submissions', async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ count: 0, error: null }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await windowHasSubmissions('window-123');

    expect(result).toBe(false);
  });

  it('should throw error on database error', async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        count: null,
        error: { message: 'Database error' },
      }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    await expect(windowHasSubmissions('window-123')).rejects.toEqual({
      message: 'Database error',
    });
  });
});

describe('windowExistsForDate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return true when window exists for date', async () => {
    // eq is called twice: .eq('baker_id', ...).eq('date', ...)
    // The second .eq() returns the final result
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn()
        .mockReturnValueOnce({ eq: vi.fn().mockResolvedValue({ count: 1, error: null }) }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await windowExistsForDate('baker-123', '2025-01-15');

    expect(result).toBe(true);
  });

  it('should return false when no window exists for date', async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn()
        .mockReturnValueOnce({ eq: vi.fn().mockResolvedValue({ count: 0, error: null }) }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await windowExistsForDate('baker-123', '2025-01-15');

    expect(result).toBe(false);
  });

  it('should exclude specified window ID when checking', async () => {
    const neqMock = vi.fn().mockResolvedValue({ count: 0, error: null });
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn()
        .mockReturnValueOnce({ eq: vi.fn().mockReturnValue({ neq: neqMock }) }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    await windowExistsForDate('baker-123', '2025-01-15', 'exclude-window');

    expect(neqMock).toHaveBeenCalledWith('id', 'exclude-window');
  });
});

describe('getExistingDatesInRange', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return dates in range', async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockResolvedValue({
        data: [{ date: '2025-01-15' }, { date: '2025-01-16' }],
        error: null,
      }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await getExistingDatesInRange(
      'baker-123',
      '2025-01-01',
      '2025-01-31'
    );

    expect(result).toEqual(['2025-01-15', '2025-01-16']);
  });

  it('should return empty array when no dates exist', async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockResolvedValue({ data: [], error: null }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await getExistingDatesInRange(
      'baker-123',
      '2025-01-01',
      '2025-01-31'
    );

    expect(result).toEqual([]);
  });

  it('should throw error on database error', async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    await expect(
      getExistingDatesInRange('baker-123', '2025-01-01', '2025-01-31')
    ).rejects.toEqual({ message: 'Database error' });
  });
});
