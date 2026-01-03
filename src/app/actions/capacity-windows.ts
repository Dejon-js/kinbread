"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { capacityWindowSchema } from "@/lib/validations";
import type { ActionResult, CapacityWindow } from "@/types";

export async function createCapacityWindow(
  formData: FormData
): Promise<ActionResult<CapacityWindow>> {
  const rawFormData = {
    date: formData.get("date") as string,
    total_slots: parseInt(formData.get("total_slots") as string, 10),
    note: (formData.get("note") as string) || null,
  };

  const validatedFields = capacityWindowSchema.safeParse(rawFormData);

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

  const newWindow: CapacityWindow = {
    id: `window-${Date.now()}`,
    baker_id: "baker-1",
    date: validatedFields.data.date,
    total_slots: validatedFields.data.total_slots,
    note: validatedFields.data.note ?? null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateCapacityWindow(
  windowId: string,
  formData: FormData
): Promise<ActionResult<CapacityWindow>> {
  const rawFormData = {
    date: formData.get("date") as string,
    total_slots: parseInt(formData.get("total_slots") as string, 10),
    note: (formData.get("note") as string) || null,
  };

  const validatedFields = capacityWindowSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.issues[0]?.message || "Invalid input",
    };
  }

  // TODO: Replace with actual Supabase update
  // For now, simulate success

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const updatedWindow: CapacityWindow = {
    id: windowId,
    baker_id: "baker-1",
    date: validatedFields.data.date,
    total_slots: validatedFields.data.total_slots,
    note: validatedFields.data.note ?? null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/windows/${windowId}`);

  return {
    success: true,
    data: updatedWindow,
  };
}

export async function deleteCapacityWindow(
  windowId: string
): Promise<ActionResult> {
  // TODO: Replace with actual Supabase delete
  // Check for existing submissions first

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Simulate check for submissions - window-1 has submissions
  if (windowId === "window-1") {
    return {
      success: false,
      error: "Cannot delete this date because it has existing submissions. Please delete the submissions first.",
      code: "HAS_SUBMISSIONS",
    };
  }

  revalidatePath("/dashboard");

  return { success: true, data: undefined };
}
