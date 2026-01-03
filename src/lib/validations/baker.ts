import { z } from "zod";

export const slugSchema = z
  .string()
  .min(1, "Slug is required")
  .max(50, "Slug must be 50 characters or less")
  .regex(
    /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/,
    "Slug must be lowercase letters, numbers, and hyphens only"
  );

export const onboardingSchema = z.object({
  business_name: z
    .string()
    .min(1, "Business name is required")
    .max(100, "Business name must be 100 characters or less"),
  slug: slugSchema,
  timezone: z.string().min(1, "Timezone is required"),
});

export const settingsSchema = z.object({
  business_name: z
    .string()
    .min(1, "Business name is required")
    .max(100, "Business name must be 100 characters or less"),
  context_message: z
    .string()
    .max(500, "Context message must be 500 characters or less")
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  timezone: z.string().min(1, "Timezone is required"),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
