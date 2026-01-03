import { describe, it, expect } from 'vitest';
import { signUpSchema, signInSchema } from './auth';

describe('auth validation schemas', () => {
  describe('signUpSchema', () => {
    it('validates correct input', () => {
      const result = signUpSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty email', () => {
      const result = signUpSchema.safeParse({
        email: '',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid email format', () => {
      const result = signUpSchema.safeParse({
        email: 'not-an-email',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('rejects password shorter than 8 characters', () => {
      const result = signUpSchema.safeParse({
        email: 'test@example.com',
        password: '1234567',
      });
      expect(result.success).toBe(false);
    });

    it('accepts password exactly 8 characters', () => {
      const result = signUpSchema.safeParse({
        email: 'test@example.com',
        password: '12345678',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('signInSchema', () => {
    it('validates correct input', () => {
      const result = signInSchema.safeParse({
        email: 'test@example.com',
        password: 'anypassword',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty email', () => {
      const result = signInSchema.safeParse({
        email: '',
        password: 'password',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid email format', () => {
      const result = signInSchema.safeParse({
        email: 'invalid',
        password: 'password',
      });
      expect(result.success).toBe(false);
    });

    it('rejects empty password', () => {
      const result = signInSchema.safeParse({
        email: 'test@example.com',
        password: '',
      });
      expect(result.success).toBe(false);
    });

    it('does not enforce password length (signin allows any length)', () => {
      const result = signInSchema.safeParse({
        email: 'test@example.com',
        password: 'a',
      });
      expect(result.success).toBe(true);
    });
  });
});
