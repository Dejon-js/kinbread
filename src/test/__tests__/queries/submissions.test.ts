import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getSubmissionsForWindow,
  getSubmissionById,
  getSubmissionsForBaker,
  countSubmissionsForWindow,
} from '@/lib/queries/submissions';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

const mockSubmission = {
  id: 'sub-123',
  baker_id: 'baker-123',
  capacity_window_id: 'window-123',
  customer_name: 'John Doe',
  customer_email: 'john@example.com',
  customer_phone: '555-1234',
  description: 'Birthday cake order',
  quantity: 1,
  budget_range: '$50-100',
  slots_consumed: 1,
  submitted_at: '2024-01-01T00:00:00Z',
};

describe('getSubmissionsForWindow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return submissions for window', async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [mockSubmission],
        error: null,
      }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await getSubmissionsForWindow('window-123');

    expect(result).toEqual([mockSubmission]);
    expect(mockSupabase.from).toHaveBeenCalledWith('submissions');
    expect(mockChain.eq).toHaveBeenCalledWith('capacity_window_id', 'window-123');
    expect(mockChain.order).toHaveBeenCalledWith('submitted_at', { ascending: false });
  });

  it('should return empty array when no submissions exist', async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await getSubmissionsForWindow('window-123');

    expect(result).toEqual([]);
  });

  it('should return empty array when data is null', async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await getSubmissionsForWindow('window-123');

    expect(result).toEqual([]);
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

    await expect(getSubmissionsForWindow('window-123')).rejects.toEqual({
      message: 'Database error',
    });
  });
});

describe('getSubmissionById', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return submission when found', async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockSubmission, error: null }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await getSubmissionById('sub-123');

    expect(result).toEqual(mockSubmission);
    expect(mockChain.eq).toHaveBeenCalledWith('id', 'sub-123');
  });

  it('should return null when submission not found', async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows returned' },
      }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await getSubmissionById('nonexistent');

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

    await expect(getSubmissionById('sub-123')).rejects.toEqual({
      code: 'PGRST500',
      message: 'Database error',
    });
  });
});

describe('getSubmissionsForBaker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return all submissions for baker', async () => {
    const submissions = [
      mockSubmission,
      { ...mockSubmission, id: 'sub-456', capacity_window_id: 'window-456' },
    ];
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: submissions, error: null }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await getSubmissionsForBaker('baker-123');

    expect(result).toEqual(submissions);
    expect(mockChain.eq).toHaveBeenCalledWith('baker_id', 'baker-123');
    expect(mockChain.order).toHaveBeenCalledWith('submitted_at', { ascending: false });
  });

  it('should return empty array when no submissions exist', async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await getSubmissionsForBaker('baker-123');

    expect(result).toEqual([]);
  });

  it('should return empty array when data is null', async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await getSubmissionsForBaker('baker-123');

    expect(result).toEqual([]);
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

    await expect(getSubmissionsForBaker('baker-123')).rejects.toEqual({
      message: 'Database error',
    });
  });
});

describe('countSubmissionsForWindow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return count of submissions', async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ count: 5, error: null }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await countSubmissionsForWindow('window-123');

    expect(result).toBe(5);
    expect(mockChain.select).toHaveBeenCalledWith('*', { count: 'exact', head: true });
    expect(mockChain.eq).toHaveBeenCalledWith('capacity_window_id', 'window-123');
  });

  it('should return 0 when no submissions exist', async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ count: 0, error: null }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await countSubmissionsForWindow('window-123');

    expect(result).toBe(0);
  });

  it('should return 0 when count is null', async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ count: null, error: null }),
    };
    mockSupabase.from.mockReturnValue(mockChain);

    const result = await countSubmissionsForWindow('window-123');

    expect(result).toBe(0);
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

    await expect(countSubmissionsForWindow('window-123')).rejects.toEqual({
      message: 'Database error',
    });
  });
});
