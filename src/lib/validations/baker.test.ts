import { describe, it, expect } from 'vitest';
import { slugSchema, onboardingSchema, settingsSchema } from './baker';

describe('baker validation schemas', () => {
  describe('slugSchema', () => {
    it('accepts valid slugs', () => {
      expect(slugSchema.safeParse('hello').success).toBe(true);
      expect(slugSchema.safeParse('hello-world').success).toBe(true);
      expect(slugSchema.safeParse('a').success).toBe(true);
      expect(slugSchema.safeParse('abc123').success).toBe(true);
    });

    it('rejects empty slugs', () => {
      expect(slugSchema.safeParse('').success).toBe(false);
    });

    it('rejects slugs with uppercase', () => {
      expect(slugSchema.safeParse('Hello').success).toBe(false);
    });

    it('rejects slugs with special characters', () => {
      expect(slugSchema.safeParse('hello_world').success).toBe(false);
      expect(slugSchema.safeParse('hello.world').success).toBe(false);
    });

    it('rejects slugs starting or ending with hyphen', () => {
      expect(slugSchema.safeParse('-hello').success).toBe(false);
      expect(slugSchema.safeParse('hello-').success).toBe(false);
    });

    it('rejects slugs longer than 50 characters', () => {
      const longSlug = 'a'.repeat(51);
      expect(slugSchema.safeParse(longSlug).success).toBe(false);
    });
  });

  describe('onboardingSchema', () => {
    it('validates correct input', () => {
      const result = onboardingSchema.safeParse({
        business_name: 'Sweet Delights',
        slug: 'sweet-delights',
        timezone: 'America/New_York',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty business name', () => {
      const result = onboardingSchema.safeParse({
        business_name: '',
        slug: 'sweet-delights',
        timezone: 'America/New_York',
      });
      expect(result.success).toBe(false);
    });

    it('rejects business name longer than 100 characters', () => {
      const result = onboardingSchema.safeParse({
        business_name: 'a'.repeat(101),
        slug: 'sweet-delights',
        timezone: 'America/New_York',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid slug', () => {
      const result = onboardingSchema.safeParse({
        business_name: 'Sweet Delights',
        slug: 'Invalid Slug!',
        timezone: 'America/New_York',
      });
      expect(result.success).toBe(false);
    });

    it('rejects empty timezone', () => {
      const result = onboardingSchema.safeParse({
        business_name: 'Sweet Delights',
        slug: 'sweet-delights',
        timezone: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('settingsSchema', () => {
    it('validates correct input', () => {
      const result = settingsSchema.safeParse({
        business_name: 'Sweet Delights',
        context_message: 'Welcome to our bakery!',
        timezone: 'America/New_York',
      });
      expect(result.success).toBe(true);
    });

    it('allows empty context message', () => {
      const result = settingsSchema.safeParse({
        business_name: 'Sweet Delights',
        context_message: '',
        timezone: 'America/New_York',
      });
      expect(result.success).toBe(true);
    });

    it('allows null context message', () => {
      const result = settingsSchema.safeParse({
        business_name: 'Sweet Delights',
        context_message: null,
        timezone: 'America/New_York',
      });
      expect(result.success).toBe(true);
    });

    it('rejects context message longer than 500 characters', () => {
      const result = settingsSchema.safeParse({
        business_name: 'Sweet Delights',
        context_message: 'a'.repeat(501),
        timezone: 'America/New_York',
      });
      expect(result.success).toBe(false);
    });

    it('rejects empty business name', () => {
      const result = settingsSchema.safeParse({
        business_name: '',
        timezone: 'America/New_York',
      });
      expect(result.success).toBe(false);
    });
  });
});
