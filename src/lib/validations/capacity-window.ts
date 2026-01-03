import { z } from "zod";

export const capacityWindowSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  total_slots: z
    .number()
    .int("Slots must be a whole number")
    .min(0, "Slots cannot be negative")
    .max(1000, "Slots cannot exceed 1000"),
  note: z
    .string()
    .max(200, "Note must be 200 characters or less")
    .optional()
    .nullable(),
});

export type CapacityWindowInput = z.infer<typeof capacityWindowSchema>;
