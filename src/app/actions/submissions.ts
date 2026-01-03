'use server';

import { createClient } from '@/lib/supabase/server';
import { createSubmissionSchema } from '@/lib/validations/submission';
import { getBakerByUserId } from '@/lib/queries/baker';
import type { ActionResult } from '@/types/actions';
import type { CreateSubmissionResult } from '@/types/database';
import { revalidatePath } from 'next/cache';

/**
 * Create a new submission (customer booking request)
 * Uses atomic database function to prevent race conditions
 */
export async function createSubmission(formData: FormData): Promise<ActionResult<{ submissionId: string }>> {
  // Parse and validate input
  const rawData = {
    capacity_window_id: formData.get('capacity_window_id'),
    customer_name: formData.get('customer_name'),
    customer_email: formData.get('customer_email'),
    customer_phone: formData.get('customer_phone') || null,
    description: formData.get('description'),
    quantity: formData.get('quantity') ? Number(formData.get('quantity')) : null,
    budget_range: formData.get('budget_range') || null,
  };

  const parsed = createSubmissionSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid input',
      code: 'VALIDATION_ERROR',
    };
  }

  const {
    capacity_window_id,
    customer_name,
    customer_email,
    customer_phone,
    description,
    quantity,
    budget_range,
  } = parsed.data;

  const supabase = await createClient();

  // Call atomic database function
  const { data, error } = await supabase.rpc('create_submission_if_available', {
    p_capacity_window_id: capacity_window_id,
    p_customer_name: customer_name,
    p_customer_email: customer_email,
    p_customer_phone: customer_phone,
    p_description: description,
    p_quantity: quantity,
    p_budget_range: budget_range,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }

  // The function returns an array with one row
  const result = data as CreateSubmissionResult[] | null;

  if (!result || result.length === 0) {
    return {
      success: false,
      error: 'Unexpected error creating submission',
      code: 'UNKNOWN_ERROR',
    };
  }

  const submissionResult = result[0];

  if (!submissionResult.success) {
    // Map error codes to user-friendly messages
    const errorMessages: Record<string, string> = {
      WINDOW_NOT_FOUND: 'This date is no longer available',
      DATE_IN_PAST: 'This date has already passed',
      NO_AVAILABILITY: 'This date is now fully booked',
    };

    return {
      success: false,
      error: errorMessages[submissionResult.error_code || ''] || 'Failed to create submission',
      code: submissionResult.error_code || 'UNKNOWN_ERROR',
    };
  }

  // Get baker slug for revalidation
  const { data: window } = await supabase
    .from('capacity_windows')
    .select('baker_id, bakers(slug)')
    .eq('id', capacity_window_id)
    .single();

  if (window?.bakers && 'slug' in window.bakers) {
    revalidatePath(`/${window.bakers.slug}`);
  }
  revalidatePath(`/dashboard/windows/${capacity_window_id}`);

  return {
    success: true,
    data: { submissionId: submissionResult.submission_id! },
  };
}

/**
 * Delete a submission (baker only)
 */
export async function deleteSubmission(submissionId: string): Promise<ActionResult> {
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

  // Get baker profile
  const baker = await getBakerByUserId(user.id);
  if (!baker) {
    return {
      success: false,
      error: 'Baker profile not found',
      code: 'PROFILE_NOT_FOUND',
    };
  }

  // Get submission and verify ownership
  const { data: submission } = await supabase
    .from('submissions')
    .select('*, capacity_windows(id)')
    .eq('id', submissionId)
    .eq('baker_id', baker.id)
    .single();

  if (!submission) {
    return {
      success: false,
      error: 'Submission not found',
      code: 'SUBMISSION_NOT_FOUND',
    };
  }

  // Delete submission
  const { error } = await supabase
    .from('submissions')
    .delete()
    .eq('id', submissionId);

  if (error) {
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }

  revalidatePath('/dashboard');
  revalidatePath(`/dashboard/windows/${submission.capacity_window_id}`);
  revalidatePath(`/${baker.slug}`);

  return {
    success: true,
    data: undefined,
  };
}
