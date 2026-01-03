import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSubmission, deleteSubmission } from '@/app/actions/submissions';

// Mock Supabase client
const mockSingle = vi.fn();
const mockFromChain = {
  select: vi.fn().mockReturnThis(),
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
  rpc: vi.fn(),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

// Mock queries
vi.mock('@/lib/queries/baker', () => ({
  getBakerByUserId: vi.fn(),
}));

import { getBakerByUserId } from '@/lib/queries/baker';

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

describe('createSubmission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.from.mockImplementation(() => mockFromChain);
  });

  it('should return validation error for missing customer name', async () => {
    const formData = new FormData();
    formData.set('capacity_window_id', '123e4567-e89b-12d3-a456-426614174000');
    formData.set('customer_name', '');
    formData.set('customer_email', 'customer@example.com');
    formData.set('description', 'A cake');

    const result = await createSubmission(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe('VALIDATION_ERROR');
      expect(result.error).toBe('Name is required');
    }
  });

  it('should return validation error for invalid email', async () => {
    const formData = new FormData();
    formData.set('capacity_window_id', '123e4567-e89b-12d3-a456-426614174000');
    formData.set('customer_name', 'Jane Doe');
    formData.set('customer_email', 'not-an-email');
    formData.set('description', 'A cake');

    const result = await createSubmission(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe('VALIDATION_ERROR');
      expect(result.error).toBe('Invalid email address');
    }
  });

  it('should return validation error for missing description', async () => {
    const formData = new FormData();
    formData.set('capacity_window_id', '123e4567-e89b-12d3-a456-426614174000');
    formData.set('customer_name', 'Jane Doe');
    formData.set('customer_email', 'jane@example.com');
    formData.set('description', '');

    const result = await createSubmission(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe('VALIDATION_ERROR');
      expect(result.error).toBe('Description is required');
    }
  });

  it('should return validation error for invalid window ID', async () => {
    const formData = new FormData();
    formData.set('capacity_window_id', 'not-a-uuid');
    formData.set('customer_name', 'Jane Doe');
    formData.set('customer_email', 'jane@example.com');
    formData.set('description', 'A beautiful cake');

    const result = await createSubmission(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe('VALIDATION_ERROR');
    }
  });

  it('should successfully create submission', async () => {
    const windowId = '123e4567-e89b-12d3-a456-426614174000';
    const submissionId = '456e7890-e89b-12d3-a456-426614174000';

    mockSupabase.rpc.mockResolvedValue({
      data: [{ success: true, submission_id: submissionId, error_code: null }],
      error: null,
    });

    mockFromChain.single.mockResolvedValue({
      data: { baker_id: 'baker-123', bakers: { slug: 'sweet-treats' } },
      error: null,
    });

    const formData = new FormData();
    formData.set('capacity_window_id', windowId);
    formData.set('customer_name', 'Jane Doe');
    formData.set('customer_email', 'jane@example.com');
    formData.set('description', 'A beautiful cake');

    const result = await createSubmission(formData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.submissionId).toBe(submissionId);
    }
  });

  it('should return error when no availability', async () => {
    mockSupabase.rpc.mockResolvedValue({
      data: [{ success: false, submission_id: null, error_code: 'NO_AVAILABILITY' }],
      error: null,
    });

    const formData = new FormData();
    formData.set('capacity_window_id', '123e4567-e89b-12d3-a456-426614174000');
    formData.set('customer_name', 'Jane Doe');
    formData.set('customer_email', 'jane@example.com');
    formData.set('description', 'A beautiful cake');

    const result = await createSubmission(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe('NO_AVAILABILITY');
      expect(result.error).toBe('This date is now fully booked');
    }
  });

  it('should return error when date in past', async () => {
    mockSupabase.rpc.mockResolvedValue({
      data: [{ success: false, submission_id: null, error_code: 'DATE_IN_PAST' }],
      error: null,
    });

    const formData = new FormData();
    formData.set('capacity_window_id', '123e4567-e89b-12d3-a456-426614174000');
    formData.set('customer_name', 'Jane Doe');
    formData.set('customer_email', 'jane@example.com');
    formData.set('description', 'A beautiful cake');

    const result = await createSubmission(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe('DATE_IN_PAST');
      expect(result.error).toBe('This date has already passed');
    }
  });

  it('should return error when window not found', async () => {
    mockSupabase.rpc.mockResolvedValue({
      data: [{ success: false, submission_id: null, error_code: 'WINDOW_NOT_FOUND' }],
      error: null,
    });

    const formData = new FormData();
    formData.set('capacity_window_id', '123e4567-e89b-12d3-a456-426614174000');
    formData.set('customer_name', 'Jane Doe');
    formData.set('customer_email', 'jane@example.com');
    formData.set('description', 'A beautiful cake');

    const result = await createSubmission(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe('WINDOW_NOT_FOUND');
      expect(result.error).toBe('This date is no longer available');
    }
  });
});

describe('deleteSubmission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.from.mockImplementation(() => mockFromChain);
  });

  it('should return error when not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
    });

    const result = await deleteSubmission('submission-123');

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

    const result = await deleteSubmission('submission-123');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe('PROFILE_NOT_FOUND');
    }
  });

  it('should return error when submission not found', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    });
    vi.mocked(getBakerByUserId).mockResolvedValue(mockBaker);
    mockFromChain.single.mockResolvedValue({ data: null, error: null });

    const result = await deleteSubmission('submission-123');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe('SUBMISSION_NOT_FOUND');
    }
  });

  it('should successfully delete submission', async () => {
    const mockSubmission = {
      id: 'submission-123',
      baker_id: 'baker-123',
      capacity_window_id: 'window-123',
      customer_name: 'Jane Doe',
      customer_email: 'jane@example.com',
      customer_phone: null,
      description: 'A cake',
      quantity: null,
      budget_range: null,
      slots_consumed: 1,
      submitted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      capacity_windows: { id: 'window-123' },
    };

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    });
    vi.mocked(getBakerByUserId).mockResolvedValue(mockBaker);
    mockSingle.mockResolvedValue({ data: mockSubmission, error: null });

    // Mock the delete chain
    mockFromChain.delete.mockReturnValue({
      eq: vi.fn().mockReturnValue({ error: null }),
    });

    const result = await deleteSubmission('submission-123');

    expect(result.success).toBe(true);
  });
});
