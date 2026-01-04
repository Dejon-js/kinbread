import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signUp, signIn, signOut, getCurrentUser } from '@/app/actions/auth';

// Mock next/navigation redirect
const mockRedirect = vi.fn();
vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    mockRedirect(url);
    throw new Error('NEXT_REDIRECT');
  },
}));

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

  it('should successfully sign up a user and redirect to onboarding', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const formData = new FormData();
    formData.set('email', 'test@example.com');
    formData.set('password', 'password123');

    await expect(signUp(formData)).rejects.toThrow('NEXT_REDIRECT');
    expect(mockRedirect).toHaveBeenCalledWith('/onboarding');
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

  it('should return error when user creation fails silently', async () => {
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const formData = new FormData();
    formData.set('email', 'test@example.com');
    formData.set('password', 'password123');

    const result = await signUp(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Failed to create user');
      expect(result.code).toBe('USER_CREATION_FAILED');
    }
  });
});

describe('signIn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully sign in a user and redirect to dashboard', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    const formData = new FormData();
    formData.set('email', 'test@example.com');
    formData.set('password', 'password123');

    await expect(signIn(formData)).rejects.toThrow('NEXT_REDIRECT');
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard');
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

  it('should call Supabase signOut and redirect to home', async () => {
    mockSupabase.auth.signOut.mockResolvedValue({ error: null });

    await expect(signOut()).rejects.toThrow('NEXT_REDIRECT');
    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith('/');
  });

  it('should return error when signOut fails', async () => {
    mockSupabase.auth.signOut.mockResolvedValue({
      error: { message: 'Sign out failed', code: 'signout_error' },
    });

    const result = await signOut();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Sign out failed');
      expect(result.code).toBe('signout_error');
    }
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
