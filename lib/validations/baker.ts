import { z } from 'zod';

/**
 * Slug validation schema
 * - Lowercase letters, numbers, and hyphens only
 * - Must start and end with alphanumeric
 * - 1-50 characters
 */
export const slugSchema = z
  .string()
  .min(1, 'Slug is required')
  .max(50, 'Slug must be 50 characters or less')
  .regex(
    /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/,
    'Slug must be lowercase letters, numbers, and hyphens only, starting and ending with a letter or number'
  );

/**
 * Onboarding form validation schema
 */
export const onboardingSchema = z.object({
  business_name: z
    .string()
    .min(1, 'Business name is required')
    .max(100, 'Business name must be 100 characters or less'),
  slug: slugSchema,
  timezone: z.string().min(1, 'Timezone is required'),
});

/**
 * Baker settings update validation schema
 */
export const settingsSchema = z.object({
  business_name: z
    .string()
    .min(1, 'Business name is required')
    .max(100, 'Business name must be 100 characters or less'),
  context_message: z
    .string()
    .max(500, 'Context message must be 500 characters or less')
    .optional()
    .nullable()
    .transform((val) => val || null),
  timezone: z.string().min(1, 'Timezone is required'),
});

/**
 * Type inference helpers
 */
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
