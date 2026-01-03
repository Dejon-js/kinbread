import { describe, it, expect } from 'vitest';
import { signUpSchema, signInSchema } from '@/lib/validations/auth';

describe('signUpSchema', () => {
  it('should validate valid signup data', () => {
    const result = signUpSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty email', () => {
    const result = signUpSchema.safeParse({
      email: '',
      password: 'password123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Email is required');
    }
  });

  it('should reject invalid email format', () => {
    const result = signUpSchema.safeParse({
      email: 'invalid-email',
      password: 'password123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Invalid email address');
    }
  });

  it('should reject password shorter than 8 characters', () => {
    const result = signUpSchema.safeParse({
      email: 'test@example.com',
      password: '1234567',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Password must be at least 8 characters');
    }
  });

  it('should reject password longer than 72 characters', () => {
    const result = signUpSchema.safeParse({
      email: 'test@example.com',
      password: 'a'.repeat(73),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Password must be 72 characters or less');
    }
  });
});

describe('signInSchema', () => {
  it('should validate valid signin data', () => {
    const result = signInSchema.safeParse({
      email: 'test@example.com',
      password: 'anypassword',
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty email', () => {
    const result = signInSchema.safeParse({
      email: '',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty password', () => {
    const result = signInSchema.safeParse({
      email: 'test@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Password is required');
    }
  });
});
