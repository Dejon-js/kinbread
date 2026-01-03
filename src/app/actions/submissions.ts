"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { submissionSchema } from "@/lib/validations";
import type { ActionResult } from "@/types";

export async function createSubmission(
  windowId: string,
  slug: string,
  formData: FormData
): Promise<ActionResult<{ submissionId: string }>> {
  const rawFormData = {
    customer_name: formData.get("customer_name") as string,
    customer_email: formData.get("customer_email") as string,
    customer_phone: (formData.get("customer_phone") as string) || null,
    description: formData.get("description") as string,
    quantity: formData.get("quantity")
      ? parseInt(formData.get("quantity") as string, 10)
      : null,
    budget_range: (formData.get("budget_range") as string) || null,
  };

  const validatedFields = submissionSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.issues[0]?.message || "Invalid input",
    };
  }

  // TODO: Replace with actual Supabase RPC call to create_submission_if_available
  // For now, simulate success

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Simulate capacity check - window-1 is full (has 3 submissions)
  if (windowId === "window-1") {
    return {
      success: false,
      error: "Sorry, this date is no longer available. Please choose another date.",
      code: "NO_AVAILABILITY",
    };
  }

  const submissionId = `sub-${Date.now()}`;

  redirect(`/${slug}/confirmation`);
}

export async function deleteSubmission(
  submissionId: string
): Promise<ActionResult> {
  // TODO: Replace with actual Supabase delete

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  revalidatePath("/dashboard");

  return { success: true, data: undefined };
}
