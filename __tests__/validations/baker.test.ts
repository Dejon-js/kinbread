import { describe, it, expect } from 'vitest';
import { slugSchema, onboardingSchema, settingsSchema } from '@/lib/validations/baker';

describe('slugSchema', () => {
  it('should validate a simple slug', () => {
    const result = slugSchema.safeParse('mybakery');
    expect(result.success).toBe(true);
  });

  it('should validate a slug with numbers', () => {
    const result = slugSchema.safeParse('bakery123');
    expect(result.success).toBe(true);
  });

  it('should validate a slug with hyphens', () => {
    const result = slugSchema.safeParse('my-bakery');
    expect(result.success).toBe(true);
  });

  it('should validate a single character slug', () => {
    const result = slugSchema.safeParse('a');
    expect(result.success).toBe(true);
  });

  it('should reject empty slug', () => {
    const result = slugSchema.safeParse('');
    expect(result.success).toBe(false);
  });

  it('should reject slug with uppercase letters', () => {
    const result = slugSchema.safeParse('MyBakery');
    expect(result.success).toBe(false);
  });

  it('should reject slug starting with hyphen', () => {
    const result = slugSchema.safeParse('-mybakery');
    expect(result.success).toBe(false);
  });

  it('should reject slug ending with hyphen', () => {
    const result = slugSchema.safeParse('mybakery-');
    expect(result.success).toBe(false);
  });

  it('should reject slug with special characters', () => {
    const result = slugSchema.safeParse('my_bakery');
    expect(result.success).toBe(false);
  });

  it('should reject slug longer than 50 characters', () => {
    const result = slugSchema.safeParse('a'.repeat(51));
    expect(result.success).toBe(false);
  });
});

describe('onboardingSchema', () => {
  it('should validate valid onboarding data', () => {
    const result = onboardingSchema.safeParse({
      business_name: 'Sweet Treats Bakery',
      slug: 'sweet-treats',
      timezone: 'America/New_York',
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty business name', () => {
    const result = onboardingSchema.safeParse({
      business_name: '',
      slug: 'sweet-treats',
      timezone: 'America/New_York',
    });
    expect(result.success).toBe(false);
  });

  it('should reject business name longer than 100 characters', () => {
    const result = onboardingSchema.safeParse({
      business_name: 'a'.repeat(101),
      slug: 'sweet-treats',
      timezone: 'America/New_York',
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty timezone', () => {
    const result = onboardingSchema.safeParse({
      business_name: 'Sweet Treats Bakery',
      slug: 'sweet-treats',
      timezone: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('settingsSchema', () => {
  it('should validate valid settings data', () => {
    const result = settingsSchema.safeParse({
      business_name: 'Sweet Treats Bakery',
      context_message: 'We specialize in custom cakes!',
      timezone: 'America/Los_Angeles',
    });
    expect(result.success).toBe(true);
  });

  it('should accept null context message', () => {
    const result = settingsSchema.safeParse({
      business_name: 'Sweet Treats Bakery',
      context_message: null,
      timezone: 'America/Los_Angeles',
    });
    expect(result.success).toBe(true);
  });

  it('should accept empty context message and transform to null', () => {
    const result = settingsSchema.safeParse({
      business_name: 'Sweet Treats Bakery',
      context_message: '',
      timezone: 'America/Los_Angeles',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.context_message).toBe(null);
    }
  });

  it('should reject context message longer than 500 characters', () => {
    const result = settingsSchema.safeParse({
      business_name: 'Sweet Treats Bakery',
      context_message: 'a'.repeat(501),
      timezone: 'America/Los_Angeles',
    });
    expect(result.success).toBe(false);
  });
});
