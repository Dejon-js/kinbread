import { describe, it, expect } from 'vitest';
import { submissionSchema } from './submission';

describe('submissionSchema', () => {
  const validSubmission = {
    customer_name: 'John Doe',
    customer_email: 'john@example.com',
    description: '6 inch chocolate cake for birthday',
  };

  it('validates correct input with required fields only', () => {
    const result = submissionSchema.safeParse(validSubmission);
    expect(result.success).toBe(true);
  });

  it('validates correct input with all fields', () => {
    const result = submissionSchema.safeParse({
      ...validSubmission,
      customer_phone: '555-123-4567',
      quantity: 2,
      budget_range: '$50-75',
    });
    expect(result.success).toBe(true);
  });

  describe('customer_name', () => {
    it('rejects empty name', () => {
      const result = submissionSchema.safeParse({
        ...validSubmission,
        customer_name: '',
      });
      expect(result.success).toBe(false);
    });

    it('rejects name longer than 100 characters', () => {
      const result = submissionSchema.safeParse({
        ...validSubmission,
        customer_name: 'a'.repeat(101),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('customer_email', () => {
    it('rejects empty email', () => {
      const result = submissionSchema.safeParse({
        ...validSubmission,
        customer_email: '',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid email format', () => {
      const result = submissionSchema.safeParse({
        ...validSubmission,
        customer_email: 'not-an-email',
      });
      expect(result.success).toBe(false);
    });

    it('accepts valid email formats', () => {
      expect(submissionSchema.safeParse({
        ...validSubmission,
        customer_email: 'test@example.com',
      }).success).toBe(true);

      expect(submissionSchema.safeParse({
        ...validSubmission,
        customer_email: 'test.name@example.co.uk',
      }).success).toBe(true);
    });
  });

  describe('customer_phone', () => {
    it('allows empty phone', () => {
      const result = submissionSchema.safeParse({
        ...validSubmission,
        customer_phone: '',
      });
      expect(result.success).toBe(true);
    });

    it('allows null phone', () => {
      const result = submissionSchema.safeParse({
        ...validSubmission,
        customer_phone: null,
      });
      expect(result.success).toBe(true);
    });

    it('rejects phone longer than 20 characters', () => {
      const result = submissionSchema.safeParse({
        ...validSubmission,
        customer_phone: '1'.repeat(21),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('description', () => {
    it('rejects empty description', () => {
      const result = submissionSchema.safeParse({
        ...validSubmission,
        description: '',
      });
      expect(result.success).toBe(false);
    });

    it('rejects description longer than 1000 characters', () => {
      const result = submissionSchema.safeParse({
        ...validSubmission,
        description: 'a'.repeat(1001),
      });
      expect(result.success).toBe(false);
    });

    it('allows description exactly 1000 characters', () => {
      const result = submissionSchema.safeParse({
        ...validSubmission,
        description: 'a'.repeat(1000),
      });
      expect(result.success).toBe(true);
    });
  });

  describe('quantity', () => {
    it('allows null quantity', () => {
      const result = submissionSchema.safeParse({
        ...validSubmission,
        quantity: null,
      });
      expect(result.success).toBe(true);
    });

    it('rejects zero quantity', () => {
      const result = submissionSchema.safeParse({
        ...validSubmission,
        quantity: 0,
      });
      expect(result.success).toBe(false);
    });

    it('rejects negative quantity', () => {
      const result = submissionSchema.safeParse({
        ...validSubmission,
        quantity: -1,
      });
      expect(result.success).toBe(false);
    });

    it('rejects non-integer quantity', () => {
      const result = submissionSchema.safeParse({
        ...validSubmission,
        quantity: 2.5,
      });
      expect(result.success).toBe(false);
    });

    it('accepts positive integer quantity', () => {
      const result = submissionSchema.safeParse({
        ...validSubmission,
        quantity: 5,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('budget_range', () => {
    it('allows null budget_range', () => {
      const result = submissionSchema.safeParse({
        ...validSubmission,
        budget_range: null,
      });
      expect(result.success).toBe(true);
    });

    it('allows empty budget_range', () => {
      const result = submissionSchema.safeParse({
        ...validSubmission,
        budget_range: '',
      });
      expect(result.success).toBe(true);
    });

    it('rejects budget_range longer than 50 characters', () => {
      const result = submissionSchema.safeParse({
        ...validSubmission,
        budget_range: 'a'.repeat(51),
      });
      expect(result.success).toBe(false);
    });
  });
});
