import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createBakerProfile, updateBakerSettings, checkSlugAvailability } from '@/app/actions/baker';

// Mock Supabase client
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
};

const mockFromChain = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

// Mock queries
vi.mock('@/lib/queries/baker', () => ({
  getBakerByUserId: vi.fn(),
  isSlugAvailable: vi.fn(),
}));

import { getBakerByUserId, isSlugAvailable } from '@/lib/queries/baker';

describe('createBakerProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.from.mockReturnValue(mockFromChain);
  });

  it('should return error when not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
    });

    const formData = new FormData();
    formData.set('business_name', 'Sweet Treats');
    formData.set('slug', 'sweet-treats');
    formData.set('timezone', 'America/New_York');

    const result = await createBakerProfile(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe('UNAUTHENTICATED');
    }
  });

  it('should return error when profile already exists', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
    });
    vi.mocked(getBakerByUserId).mockResolvedValue({
      id: 'baker-123',
      user_id: 'user-123',
      email: 'test@example.com',
      business_name: 'Existing Bakery',
      slug: 'existing',
      context_message: null,
      timezone: 'America/New_York',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const formData = new FormData();
    formData.set('business_name', 'Sweet Treats');
    formData.set('slug', 'sweet-treats');
    formData.set('timezone', 'America/New_York');

    const result = await createBakerProfile(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe('PROFILE_EXISTS');
    }
  });

  it('should return validation error for invalid slug', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
    });
    vi.mocked(getBakerByUserId).mockResolvedValue(null);

    const formData = new FormData();
    formData.set('business_name', 'Sweet Treats');
    formData.set('slug', 'INVALID-SLUG');
    formData.set('timezone', 'America/New_York');

    const result = await createBakerProfile(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe('VALIDATION_ERROR');
    }
  });

  it('should return error when slug is taken', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
    });
    vi.mocked(getBakerByUserId).mockResolvedValue(null);
    vi.mocked(isSlugAvailable).mockResolvedValue(false);

    const formData = new FormData();
    formData.set('business_name', 'Sweet Treats');
    formData.set('slug', 'taken-slug');
    formData.set('timezone', 'America/New_York');

    const result = await createBakerProfile(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe('SLUG_TAKEN');
    }
  });

  it('should successfully create baker profile', async () => {
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

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
    });
    vi.mocked(getBakerByUserId).mockResolvedValue(null);
    vi.mocked(isSlugAvailable).mockResolvedValue(true);
    mockFromChain.single.mockResolvedValue({ data: mockBaker, error: null });

    const formData = new FormData();
    formData.set('business_name', 'Sweet Treats');
    formData.set('slug', 'sweet-treats');
    formData.set('timezone', 'America/New_York');

    const result = await createBakerProfile(formData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.business_name).toBe('Sweet Treats');
      expect(result.data.slug).toBe('sweet-treats');
    }
  });
});

describe('updateBakerSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.from.mockReturnValue(mockFromChain);
  });

  it('should return error when not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
    });

    const formData = new FormData();
    formData.set('business_name', 'Updated Name');
    formData.set('timezone', 'America/New_York');

    const result = await updateBakerSettings(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe('UNAUTHENTICATED');
    }
  });

  it('should return error when profile not found', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
    });
    vi.mocked(getBakerByUserId).mockResolvedValue(null);

    const formData = new FormData();
    formData.set('business_name', 'Updated Name');
    formData.set('timezone', 'America/New_York');

    const result = await updateBakerSettings(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe('PROFILE_NOT_FOUND');
    }
  });

  it('should successfully update baker settings', async () => {
    const existingBaker = {
      id: 'baker-123',
      user_id: 'user-123',
      email: 'test@example.com',
      business_name: 'Old Name',
      slug: 'old-slug',
      context_message: null,
      timezone: 'America/New_York',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updatedBaker = {
      ...existingBaker,
      business_name: 'Updated Name',
      context_message: 'New message',
    };

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
    });
    vi.mocked(getBakerByUserId).mockResolvedValue(existingBaker);
    mockFromChain.single.mockResolvedValue({ data: updatedBaker, error: null });

    const formData = new FormData();
    formData.set('business_name', 'Updated Name');
    formData.set('context_message', 'New message');
    formData.set('timezone', 'America/New_York');

    const result = await updateBakerSettings(formData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.business_name).toBe('Updated Name');
    }
  });
});

describe('checkSlugAvailability', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return validation error for invalid slug', async () => {
    const result = await checkSlugAvailability('INVALID-SLUG');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe('VALIDATION_ERROR');
    }
  });

  it('should return available true when slug is available', async () => {
    vi.mocked(isSlugAvailable).mockResolvedValue(true);

    const result = await checkSlugAvailability('available-slug');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.available).toBe(true);
    }
  });

  it('should return available false when slug is taken', async () => {
    vi.mocked(isSlugAvailable).mockResolvedValue(false);

    const result = await checkSlugAvailability('taken-slug');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.available).toBe(false);
    }
  });
});
