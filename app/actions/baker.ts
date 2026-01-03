'use server';

import { createClient } from '@/lib/supabase/server';
import { onboardingSchema, settingsSchema, slugSchema } from '@/lib/validations/baker';
import { getBakerByUserId, isSlugAvailable } from '@/lib/queries/baker';
import type { ActionResult } from '@/types/actions';
import type { Baker } from '@/types/database';
import { revalidatePath } from 'next/cache';

/**
 * Create a new baker profile (onboarding)
 */
export async function createBakerProfile(formData: FormData): Promise<ActionResult<Baker>> {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return {
      success: false,
      error: 'Not authenticated',
      code: 'UNAUTHENTICATED',
    };
  }

  // Check if baker profile already exists
  const existingBaker = await getBakerByUserId(user.id);
  if (existingBaker) {
    return {
      success: false,
      error: 'Baker profile already exists',
      code: 'PROFILE_EXISTS',
    };
  }

  // Parse and validate input
  const rawData = {
    business_name: formData.get('business_name'),
    slug: formData.get('slug'),
    timezone: formData.get('timezone'),
  };

  const parsed = onboardingSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid input',
      code: 'VALIDATION_ERROR',
    };
  }

  const { business_name, slug, timezone } = parsed.data;

  // Check slug availability
  const slugAvailable = await isSlugAvailable(slug);
  if (!slugAvailable) {
    return {
      success: false,
      error: 'This URL is already taken',
      code: 'SLUG_TAKEN',
    };
  }

  // Create baker profile
  const { data: baker, error } = await supabase
    .from('bakers')
    .insert({
      user_id: user.id,
      email: user.email!,
      business_name,
      slug,
      timezone,
    })
    .select()
    .single();

  if (error) {
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }

  revalidatePath('/dashboard');

  return {
    success: true,
    data: baker,
  };
}

/**
 * Update baker settings
 */
export async function updateBakerSettings(formData: FormData): Promise<ActionResult<Baker>> {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return {
      success: false,
      error: 'Not authenticated',
      code: 'UNAUTHENTICATED',
    };
  }

  // Get existing baker profile
  const existingBaker = await getBakerByUserId(user.id);
  if (!existingBaker) {
    return {
      success: false,
      error: 'Baker profile not found',
      code: 'PROFILE_NOT_FOUND',
    };
  }

  // Parse and validate input
  const rawData = {
    business_name: formData.get('business_name'),
    context_message: formData.get('context_message') || null,
    timezone: formData.get('timezone'),
  };

  const parsed = settingsSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid input',
      code: 'VALIDATION_ERROR',
    };
  }

  const { business_name, context_message, timezone } = parsed.data;

  // Update baker profile
  const { data: baker, error } = await supabase
    .from('bakers')
    .update({
      business_name,
      context_message,
      timezone,
    })
    .eq('id', existingBaker.id)
    .select()
    .single();

  if (error) {
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/settings');
  revalidatePath(`/${existingBaker.slug}`);

  return {
    success: true,
    data: baker,
  };
}

/**
 * Check if a slug is available
 */
export async function checkSlugAvailability(slug: string): Promise<ActionResult<{ available: boolean }>> {
  // Validate slug format first
  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid slug format',
      code: 'VALIDATION_ERROR',
    };
  }

  const available = await isSlugAvailable(slug);

  return {
    success: true,
    data: { available },
  };
}
