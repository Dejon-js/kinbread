import { describe, it, expect } from 'vitest';
import { submissionSchema, createSubmissionSchema } from '@/lib/validations/submission';

describe('submissionSchema', () => {
  it('should validate valid submission data', () => {
    const result = submissionSchema.safeParse({
      customer_name: 'Jane Doe',
      customer_email: 'jane@example.com',
      description: '6" round chocolate cake with sage green florals',
    });
    expect(result.success).toBe(true);
  });

  it('should validate submission with all optional fields', () => {
    const result = submissionSchema.safeParse({
      customer_name: 'Jane Doe',
      customer_email: 'jane@example.com',
      customer_phone: '555-123-4567',
      description: '6" round chocolate cake',
      quantity: 2,
      budget_range: '$100-150',
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty customer name', () => {
    const result = submissionSchema.safeParse({
      customer_name: '',
      customer_email: 'jane@example.com',
      description: 'A cake',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Name is required');
    }
  });

  it('should reject customer name longer than 100 characters', () => {
    const result = submissionSchema.safeParse({
      customer_name: 'a'.repeat(101),
      customer_email: 'jane@example.com',
      description: 'A cake',
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty email', () => {
    const result = submissionSchema.safeParse({
      customer_name: 'Jane Doe',
      customer_email: '',
      description: 'A cake',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Email is required');
    }
  });

  it('should reject invalid email format', () => {
    const result = submissionSchema.safeParse({
      customer_name: 'Jane Doe',
      customer_email: 'not-an-email',
      description: 'A cake',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Invalid email address');
    }
  });

  it('should reject empty description', () => {
    const result = submissionSchema.safeParse({
      customer_name: 'Jane Doe',
      customer_email: 'jane@example.com',
      description: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Description is required');
    }
  });

  it('should reject description longer than 1000 characters', () => {
    const result = submissionSchema.safeParse({
      customer_name: 'Jane Doe',
      customer_email: 'jane@example.com',
      description: 'a'.repeat(1001),
    });
    expect(result.success).toBe(false);
  });

  it('should accept null phone and transform empty to null', () => {
    const result = submissionSchema.safeParse({
      customer_name: 'Jane Doe',
      customer_email: 'jane@example.com',
      customer_phone: '',
      description: 'A cake',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.customer_phone).toBe(null);
    }
  });

  it('should reject phone longer than 20 characters', () => {
    const result = submissionSchema.safeParse({
      customer_name: 'Jane Doe',
      customer_email: 'jane@example.com',
      customer_phone: '1'.repeat(21),
      description: 'A cake',
    });
    expect(result.success).toBe(false);
  });

  it('should reject non-positive quantity', () => {
    const result = submissionSchema.safeParse({
      customer_name: 'Jane Doe',
      customer_email: 'jane@example.com',
      description: 'A cake',
      quantity: 0,
    });
    expect(result.success).toBe(false);
  });

  it('should reject non-integer quantity', () => {
    const result = submissionSchema.safeParse({
      customer_name: 'Jane Doe',
      customer_email: 'jane@example.com',
      description: 'A cake',
      quantity: 1.5,
    });
    expect(result.success).toBe(false);
  });

  it('should reject budget range longer than 50 characters', () => {
    const result = submissionSchema.safeParse({
      customer_name: 'Jane Doe',
      customer_email: 'jane@example.com',
      description: 'A cake',
      budget_range: 'a'.repeat(51),
    });
    expect(result.success).toBe(false);
  });
});

describe('createSubmissionSchema', () => {
  it('should validate with valid window ID', () => {
    const result = createSubmissionSchema.safeParse({
      capacity_window_id: '123e4567-e89b-12d3-a456-426614174000',
      customer_name: 'Jane Doe',
      customer_email: 'jane@example.com',
      description: 'A wedding cake',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid window ID', () => {
    const result = createSubmissionSchema.safeParse({
      capacity_window_id: 'not-a-uuid',
      customer_name: 'Jane Doe',
      customer_email: 'jane@example.com',
      description: 'A wedding cake',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Invalid window ID');
    }
  });
});
