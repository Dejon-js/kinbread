import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createCapacityWindow,
  updateCapacityWindow,
  deleteCapacityWindow,
} from '@/app/actions/capacity-windows';

// Mock Supabase client
const mockSingle = vi.fn();
const mockFromChain = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: mockSingle,
};

// Make eq() chainable and return object with single
mockFromChain.eq.mockImplementation(() => ({
  eq: mockFromChain.eq,
  single: mockSingle,
  error: null,
}));

const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(() => mockFromChain),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

// Mock queries
vi.mock('@/lib/queries/baker', () => ({
  getBakerByUserId: vi.fn(),
}));

vi.mock('@/lib/queries/capacity-windows', () => ({
  windowExistsForDate: vi.fn(),
  windowHasSubmissions: vi.fn(),
}));

import { getBakerByUserId } from '@/lib/queries/baker';
import { windowExistsForDate, windowHasSubmissions } from '@/lib/queries/capacity-windows';

const mockBaker = {
  id: 'baker-123',
  user_id: 'user-123',
  email: 'test@example.com',
  business_name: 'Sweet Treats',
  slug: 'sweet-treats',
  context_message: null,
  timezone: 'America/New_York',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('createCapacityWindow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.from.mockImplementation(() => mockFromChain);
  });

  it('should return error when not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
    });

    const formData = new FormData();
    formData.set('date', '2024-12-25');
    formData.set('total_slots', '5');

    const result = await createCapacityWindow(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe('UNAUTHENTICATED');
    }
  });

  it('should return error when baker profile not found', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    });
    vi.mocked(getBakerByUserId).mockResolvedValue(null);

    const formData = new FormData();
    formData.set('date', '2024-12-25');
    formData.set('total_slots', '5');

    const result = await createCapacityWindow(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe('PROFILE_NOT_FOUND');
    }
  });

  it('should return validation error for invalid date format', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    });
    vi.mocked(getBakerByUserId).mockResolvedValue(mockBaker);

    const formData = new FormData();
    formData.set('date', '12-25-2024');
    formData.set('total_slots', '5');

    const result = await createCapacityWindow(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe('VALIDATION_ERROR');
    }
  });

  it('should return error when window already exists for date', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    });
    vi.mocked(getBakerByUserId).mockResolvedValue(mockBaker);
    vi.mocked(windowExistsForDate).mockResolvedValue(true);

    const formData = new FormData();
    formData.set('date', '2024-12-25');
    formData.set('total_slots', '5');

    const result = await createCapacityWindow(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe('DUPLICATE_DATE');
    }
  });

  it('should successfully create capacity window', async () => {
    const mockWindow = {
      id: 'window-123',
      baker_id: 'baker-123',
      date: '2024-12-25',
      total_slots: 5,
      note: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    });
    vi.mocked(getBakerByUserId).mockResolvedValue(mockBaker);
    vi.mocked(windowExistsForDate).mockResolvedValue(false);
    mockFromChain.single.mockResolvedValue({ data: mockWindow, error: null });

    const formData = new FormData();
    formData.set('date', '2024-12-25');
    formData.set('total_slots', '5');

    const result = await createCapacityWindow(formData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.date).toBe('2024-12-25');
      expect(result.data.total_slots).toBe(5);
    }
  });
});

describe('updateCapacityWindow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.from.mockImplementation(() => mockFromChain);
  });

  it('should return error when not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
    });

    const formData = new FormData();
    formData.set('id', '123e4567-e89b-12d3-a456-426614174000');
    formData.set('date', '2024-12-25');
    formData.set('total_slots', '10');

    const result = await updateCapacityWindow(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe('UNAUTHENTICATED');
    }
  });

  it('should return error when window not found', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    });
    vi.mocked(getBakerByUserId).mockResolvedValue(mockBaker);
    mockFromChain.single.mockResolvedValue({ data: null, error: null });

    const formData = new FormData();
    formData.set('id', '123e4567-e89b-12d3-a456-426614174000');
    formData.set('date', '2024-12-25');
    formData.set('total_slots', '10');

    const result = await updateCapacityWindow(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe('WINDOW_NOT_FOUND');
    }
  });
});

describe('deleteCapacityWindow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.from.mockImplementation(() => mockFromChain);
  });

  it('should return error when not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
    });

    const result = await deleteCapacityWindow('window-123');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe('UNAUTHENTICATED');
    }
  });

  it('should return error when window has submissions', async () => {
    const mockWindow = {
      id: 'window-123',
      baker_id: 'baker-123',
      date: '2024-12-25',
      total_slots: 5,
      note: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    });
    vi.mocked(getBakerByUserId).mockResolvedValue(mockBaker);
    mockFromChain.single.mockResolvedValue({ data: mockWindow, error: null });
    vi.mocked(windowHasSubmissions).mockResolvedValue(true);

    const result = await deleteCapacityWindow('window-123');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe('HAS_SUBMISSIONS');
    }
  });

  it('should successfully delete window without submissions', async () => {
    const mockWindow = {
      id: 'window-123',
      baker_id: 'baker-123',
      date: '2024-12-25',
      total_slots: 5,
      note: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    });
    vi.mocked(getBakerByUserId).mockResolvedValue(mockBaker);
    mockSingle.mockResolvedValue({ data: mockWindow, error: null });
    vi.mocked(windowHasSubmissions).mockResolvedValue(false);

    // Mock the delete chain
    mockFromChain.delete.mockReturnValue({
      eq: vi.fn().mockReturnValue({ error: null }),
    });

    const result = await deleteCapacityWindow('window-123');

    expect(result.success).toBe(true);
  });
});
