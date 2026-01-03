"use server";

import { redirect } from "next/navigation";
import { onboardingSchema, settingsSchema } from "@/lib/validations";
import { mockBaker } from "@/lib/mock-data";
import type { ActionResult, Baker } from "@/types";

export async function createBakerProfile(
  formData: FormData
): Promise<ActionResult<Baker>> {
  const rawFormData = {
    business_name: formData.get("business_name") as string,
    slug: formData.get("slug") as string,
    timezone: formData.get("timezone") as string,
  };

  const validatedFields = onboardingSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.issues[0]?.message || "Invalid input",
    };
  }

  // TODO: Replace with actual Supabase insert
  // For now, simulate success

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  redirect("/dashboard");
}

export async function updateBakerSettings(
  formData: FormData
): Promise<ActionResult<Baker>> {
  const rawFormData = {
    business_name: formData.get("business_name") as string,
    context_message: formData.get("context_message") as string || null,
    timezone: formData.get("timezone") as string,
  };

  const validatedFields = settingsSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.issues[0]?.message || "Invalid input",
    };
  }

  // TODO: Replace with actual Supabase update
  // For now, return mock data

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    success: true,
    data: {
      ...mockBaker,
      ...validatedFields.data,
    },
  };
}

export async function checkSlugAvailability(
  slug: string
): Promise<ActionResult<{ available: boolean }>> {
  // TODO: Replace with actual Supabase query
  // For now, simulate - only "taken-slug" is unavailable

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const takenSlugs = ["taken-slug", "sweet-delights", "test"];
  const available = !takenSlugs.includes(slug.toLowerCase());

  return {
    success: true,
    data: { available },
  };
}
