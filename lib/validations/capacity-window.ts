import { z } from 'zod';

/**
 * Capacity window creation/update validation schema
 */
export const capacityWindowSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (expected YYYY-MM-DD)'),
  total_slots: z
    .number()
    .int('Slots must be a whole number')
    .min(0, 'Slots cannot be negative')
    .max(1000, 'Slots cannot exceed 1000'),
  note: z
    .string()
    .max(200, 'Note must be 200 characters or less')
    .optional()
    .nullable()
    .transform((val) => val || null),
});

/**
 * Schema for updating an existing window (includes id)
 */
export const updateCapacityWindowSchema = capacityWindowSchema.extend({
  id: z.string().uuid('Invalid window ID'),
});

/**
 * Type inference helpers
 */
export type CapacityWindowInput = z.infer<typeof capacityWindowSchema>;
export type UpdateCapacityWindowInput = z.infer<typeof updateCapacityWindowSchema>;
