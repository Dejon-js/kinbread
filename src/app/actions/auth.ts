"use server";

import { redirect } from "next/navigation";
import { signUpSchema, signInSchema } from "@/lib/validations";
import type { AuthActionResult } from "@/types";

export async function signUp(formData: FormData): Promise<AuthActionResult> {
  const rawFormData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const validatedFields = signUpSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.issues[0]?.message || "Invalid input",
    };
  }

  // TODO: Replace with actual Supabase auth
  // For now, simulate success and redirect to onboarding

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  redirect("/onboarding");
}

export async function signIn(formData: FormData): Promise<AuthActionResult> {
  const rawFormData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const validatedFields = signInSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.issues[0]?.message || "Invalid input",
    };
  }

  // TODO: Replace with actual Supabase auth
  // For now, simulate success and redirect to dashboard

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  redirect("/dashboard");
}

export async function signOut(): Promise<void> {
  // TODO: Replace with actual Supabase auth

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  redirect("/");
}
