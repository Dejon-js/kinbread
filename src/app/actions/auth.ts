'use server';

import { createClient } from '@/lib/supabase/server';
import { signUpSchema, signInSchema } from '@/lib/validations/auth';
import type { ActionResult } from '@/types/actions';
import { redirect } from 'next/navigation';

/**
 * Sign up a new user with email and password
 */
export async function signUp(formData: FormData): Promise<ActionResult<{ userId: string }>> {
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  // Validate input
  const parsed = signUpSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid input',
      code: 'VALIDATION_ERROR',
    };
  }

  const { email, password } = parsed.data;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }

  if (!data.user) {
    return {
      success: false,
      error: 'Failed to create user',
      code: 'USER_CREATION_FAILED',
    };
  }

  redirect('/onboarding');
}

/**
 * Sign in an existing user with email and password
 */
export async function signIn(formData: FormData): Promise<ActionResult> {
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  // Validate input
  const parsed = signInSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid input',
      code: 'VALIDATION_ERROR',
    };
  }

  const { email, password } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }

  redirect('/dashboard');
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }

  redirect('/');
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
