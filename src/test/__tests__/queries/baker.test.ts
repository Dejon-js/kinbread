import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getCurrentBaker,
  getBakerByUserId,
  getBakerBySlug,
  isSlugAvailable,
  getBakerById,
} from '@/lib/queries/baker';

// Mock Supabase client
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

const mockBaker = {
  id: 'baker-123',
  user_id: 'user-123',
  email: 'baker@example.com',
  business_name: 'Sweet Treats',
  slug: 'sweet-treats',
  context_message: 'Welcome to my bakery!',
  timezone: 'America/New_York',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('getCurrentBaker', () => {
  let mockChain: ReturnType<typeof createMockChain>;

  function createMockChain() {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    };
    return chain;
  }

  beforeEach(() => {
    vi.clearAllMocks();
    mockChain = createMockChain();
    mockSupabase.from.mockReturnValue(mockChain);
  });

  it('should return null when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
    });

    const result = await getCurrentBaker();

    expect(result).toBeNull();
  });

  it('should return baker when user is authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    });
    mockChain.single.mockResolvedValue({ data: mockBaker, error: null });

    const result = await getCurrentBaker();

    expect(result).toEqual(mockBaker);
    expect(mockSupabase.from).toHaveBeenCalledWith('bakers');
  });

  it('should return null when baker profile does not exist', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    });
    mockChain.single.mockResolvedValue({
      data: null,
      error: { code: 'PGRST116', message: 'No rows returned' },
    });

    const result = await getCurrentBaker();

    expect(result).toBeNull();
  });
});

describe('getBakerByUserId', () => {
  let mockChain: { select: ReturnType<typeof vi.fn>; eq: ReturnType<typeof vi.fn>; single: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();
    mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    };
    mockSupabase.from.mockReturnValue(mockChain);
  });

  it('should return baker when found', async () => {
    mockChain.single.mockResolvedValue({ data: mockBaker, error: null });

    const result = await getBakerByUserId('user-123');

    expect(result).toEqual(mockBaker);
    expect(mockChain.eq).toHaveBeenCalledWith('user_id', 'user-123');
  });

  it('should return null when baker not found', async () => {
    mockChain.single.mockResolvedValue({
      data: null,
      error: { code: 'PGRST116', message: 'No rows returned' },
    });

    const result = await getBakerByUserId('nonexistent-user');

    expect(result).toBeNull();
  });

  it('should throw error for other database errors', async () => {
    mockChain.single.mockResolvedValue({
      data: null,
      error: { code: 'PGRST500', message: 'Database error' },
    });

    await expect(getBakerByUserId('user-123')).rejects.toEqual({
      code: 'PGRST500',
      message: 'Database error',
    });
  });
});

describe('getBakerBySlug', () => {
  let mockChain: { select: ReturnType<typeof vi.fn>; eq: ReturnType<typeof vi.fn>; single: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();
    mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    };
    mockSupabase.from.mockReturnValue(mockChain);
  });

  it('should return public baker view when found', async () => {
    const publicBaker = {
      id: 'baker-123',
      business_name: 'Sweet Treats',
      slug: 'sweet-treats',
      context_message: 'Welcome!',
      timezone: 'America/New_York',
    };
    mockChain.single.mockResolvedValue({ data: publicBaker, error: null });

    const result = await getBakerBySlug('sweet-treats');

    expect(result).toEqual(publicBaker);
    expect(mockChain.select).toHaveBeenCalledWith(
      'id, business_name, slug, context_message, timezone'
    );
    expect(mockChain.eq).toHaveBeenCalledWith('slug', 'sweet-treats');
  });

  it('should return null when baker not found', async () => {
    mockChain.single.mockResolvedValue({
      data: null,
      error: { code: 'PGRST116', message: 'No rows returned' },
    });

    const result = await getBakerBySlug('nonexistent');

    expect(result).toBeNull();
  });

  it('should throw error for other database errors', async () => {
    mockChain.single.mockResolvedValue({
      data: null,
      error: { code: 'PGRST500', message: 'Database error' },
    });

    await expect(getBakerBySlug('sweet-treats')).rejects.toEqual({
      code: 'PGRST500',
      message: 'Database error',
    });
  });
});

describe('isSlugAvailable', () => {
  let mockChain: { select: ReturnType<typeof vi.fn>; eq: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();
    mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn(),
    };
    mockSupabase.from.mockReturnValue(mockChain);
  });

  it('should return true when slug is available', async () => {
    mockChain.eq.mockResolvedValue({ count: 0, error: null });

    const result = await isSlugAvailable('available-slug');

    expect(result).toBe(true);
  });

  it('should return false when slug is taken', async () => {
    mockChain.eq.mockResolvedValue({ count: 1, error: null });

    const result = await isSlugAvailable('taken-slug');

    expect(result).toBe(false);
  });

  it('should throw error on database error', async () => {
    mockChain.eq.mockResolvedValue({
      count: null,
      error: { code: 'PGRST500', message: 'Database error' },
    });

    await expect(isSlugAvailable('any-slug')).rejects.toEqual({
      code: 'PGRST500',
      message: 'Database error',
    });
  });
});

describe('getBakerById', () => {
  let mockChain: { select: ReturnType<typeof vi.fn>; eq: ReturnType<typeof vi.fn>; single: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();
    mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    };
    mockSupabase.from.mockReturnValue(mockChain);
  });

  it('should return baker when found', async () => {
    mockChain.single.mockResolvedValue({ data: mockBaker, error: null });

    const result = await getBakerById('baker-123');

    expect(result).toEqual(mockBaker);
    expect(mockChain.eq).toHaveBeenCalledWith('id', 'baker-123');
  });

  it('should return null when baker not found', async () => {
    mockChain.single.mockResolvedValue({
      data: null,
      error: { code: 'PGRST116', message: 'No rows returned' },
    });

    const result = await getBakerById('nonexistent');

    expect(result).toBeNull();
  });

  it('should throw error for other database errors', async () => {
    mockChain.single.mockResolvedValue({
      data: null,
      error: { code: 'PGRST500', message: 'Database error' },
    });

    await expect(getBakerById('baker-123')).rejects.toEqual({
      code: 'PGRST500',
      message: 'Database error',
    });
  });
});
