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
    .nullable()
    .transform((val) => (val === "" ? null : val)),
});

export const updateCapacityWindowSchema = capacityWindowSchema.extend({
  id: z.string().uuid("Invalid window ID"),
});

export const dateRangeWindowSchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid start date format"),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid end date format"),
  total_slots: z
    .number()
    .int("Slots must be a whole number")
    .min(0, "Slots cannot be negative")
    .max(1000, "Slots cannot exceed 1000"),
  note: z
    .string()
    .max(200, "Note must be 200 characters or less")
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
}).refine(
  (data) => new Date(data.end_date) >= new Date(data.start_date),
  { message: "End date must be on or after start date", path: ["end_date"] }
).refine(
  (data) => {
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diffDays <= 90;
  },
  { message: "Date range cannot exceed 90 days", path: ["end_date"] }
);

export type CapacityWindowInput = z.infer<typeof capacityWindowSchema>;
export type UpdateCapacityWindowInput = z.infer<typeof updateCapacityWindowSchema>;
export type DateRangeWindowInput = z.infer<typeof dateRangeWindowSchema>;
