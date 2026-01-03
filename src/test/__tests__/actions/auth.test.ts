import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signUp, signIn, signOut, getCurrentUser } from '@/app/actions/auth';

// Mock the Supabase server client
const mockSupabase = {
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getUser: vi.fn(),
  },
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

describe('signUp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully sign up a user', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const formData = new FormData();
    formData.set('email', 'test@example.com');
    formData.set('password', 'password123');

    const result = await signUp(formData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.userId).toBe('user-123');
    }
  });

  it('should return validation error for invalid email', async () => {
    const formData = new FormData();
    formData.set('email', 'invalid-email');
    formData.set('password', 'password123');

    const result = await signUp(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe('VALIDATION_ERROR');
      expect(result.error).toBe('Invalid email address');
    }
  });

  it('should return validation error for short password', async () => {
    const formData = new FormData();
    formData.set('email', 'test@example.com');
    formData.set('password', '1234567');

    const result = await signUp(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe('VALIDATION_ERROR');
    }
  });

  it('should return error when Supabase fails', async () => {
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: null },
      error: { message: 'Email already registered', code: 'user_already_exists' },
    });

    const formData = new FormData();
    formData.set('email', 'existing@example.com');
    formData.set('password', 'password123');

    const result = await signUp(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Email already registered');
    }
  });
});

describe('signIn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully sign in a user', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    const formData = new FormData();
    formData.set('email', 'test@example.com');
    formData.set('password', 'password123');

    const result = await signIn(formData);

    expect(result.success).toBe(true);
  });

  it('should return validation error for empty email', async () => {
    const formData = new FormData();
    formData.set('email', '');
    formData.set('password', 'password123');

    const result = await signIn(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe('VALIDATION_ERROR');
    }
  });

  it('should return validation error for empty password', async () => {
    const formData = new FormData();
    formData.set('email', 'test@example.com');
    formData.set('password', '');

    const result = await signIn(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe('VALIDATION_ERROR');
      expect(result.error).toBe('Password is required');
    }
  });

  it('should return error for invalid credentials', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid login credentials', code: 'invalid_credentials' },
    });

    const formData = new FormData();
    formData.set('email', 'test@example.com');
    formData.set('password', 'wrongpassword');

    const result = await signIn(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Invalid login credentials');
    }
  });
});

describe('signOut', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call Supabase signOut', async () => {
    mockSupabase.auth.signOut.mockResolvedValue({ error: null });

    // Call signOut - redirect is mocked so it won't actually throw
    await signOut();
    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
  });
});

describe('getCurrentUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return user when authenticated', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
    });

    const user = await getCurrentUser();

    expect(user).toEqual(mockUser);
  });

  it('should return null when not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
    });

    const user = await getCurrentUser();

    expect(user).toBeNull();
  });
});
