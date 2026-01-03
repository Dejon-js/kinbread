import { z } from "zod";

export const submissionSchema = z.object({
  customer_name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  customer_email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  customer_phone: z
    .string()
    .max(20, "Phone must be 20 characters or less")
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  description: z
    .string()
    .min(1, "Description is required")
    .max(1000, "Description must be 1000 characters or less"),
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .positive("Quantity must be positive")
    .optional()
    .nullable(),
  budget_range: z
    .string()
    .max(50, "Budget range must be 50 characters or less")
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
});

export const createSubmissionSchema = submissionSchema.extend({
  capacity_window_id: z.string().uuid("Invalid capacity window ID"),
});

export type SubmissionInput = z.infer<typeof submissionSchema>;
export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;
