'use server';

import { createClient } from '@/lib/supabase/server';
import { capacityWindowSchema, updateCapacityWindowSchema } from '@/lib/validations/capacity-window';
import { getBakerByUserId } from '@/lib/queries/baker';
import { windowExistsForDate, windowHasSubmissions } from '@/lib/queries/capacity-windows';
import type { ActionResult } from '@/types/actions';
import type { CapacityWindow } from '@/types/database';
import { revalidatePath } from 'next/cache';

/**
 * Create a new capacity window
 */
export async function createCapacityWindow(formData: FormData): Promise<ActionResult<CapacityWindow>> {
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

  // Parse and validate input
  const rawData = {
    date: formData.get('date'),
    total_slots: Number(formData.get('total_slots')),
    note: formData.get('note') || null,
  };

  const parsed = capacityWindowSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid input',
      code: 'VALIDATION_ERROR',
    };
  }

  const { date, total_slots, note } = parsed.data;

  // Check if window already exists for this date
  const exists = await windowExistsForDate(baker.id, date);
  if (exists) {
    return {
      success: false,
      error: 'You already have a capacity window for this date',
      code: 'DUPLICATE_DATE',
    };
  }

  // Create capacity window
  const { data: window, error } = await supabase
    .from('capacity_windows')
    .insert({
      baker_id: baker.id,
      date,
      total_slots,
      note,
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
  revalidatePath(`/${baker.slug}`);

  return {
    success: true,
    data: window,
  };
}

/**
 * Update an existing capacity window
 */
export async function updateCapacityWindow(formData: FormData): Promise<ActionResult<CapacityWindow>> {
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

  // Parse and validate input
  const rawData = {
    id: formData.get('id'),
    date: formData.get('date'),
    total_slots: Number(formData.get('total_slots')),
    note: formData.get('note') || null,
  };

  const parsed = updateCapacityWindowSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid input',
      code: 'VALIDATION_ERROR',
    };
  }

  const { id, date, total_slots, note } = parsed.data;

  // Check if window exists and belongs to baker
  const { data: existingWindow } = await supabase
    .from('capacity_windows')
    .select('*')
    .eq('id', id)
    .eq('baker_id', baker.id)
    .single();

  if (!existingWindow) {
    return {
      success: false,
      error: 'Capacity window not found',
      code: 'WINDOW_NOT_FOUND',
    };
  }

  // Check if date is being changed and if new date already exists
  if (date !== existingWindow.date) {
    const exists = await windowExistsForDate(baker.id, date, id);
    if (exists) {
      return {
        success: false,
        error: 'You already have a capacity window for this date',
        code: 'DUPLICATE_DATE',
      };
    }
  }

  // Update capacity window
  const { data: window, error } = await supabase
    .from('capacity_windows')
    .update({
      date,
      total_slots,
      note,
    })
    .eq('id', id)
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
  revalidatePath(`/dashboard/windows/${id}`);
  revalidatePath(`/${baker.slug}`);

  return {
    success: true,
    data: window,
  };
}

/**
 * Delete a capacity window (only if no submissions)
 */
export async function deleteCapacityWindow(windowId: string): Promise<ActionResult> {
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

  // Check if window exists and belongs to baker
  const { data: existingWindow } = await supabase
    .from('capacity_windows')
    .select('*')
    .eq('id', windowId)
    .eq('baker_id', baker.id)
    .single();

  if (!existingWindow) {
    return {
      success: false,
      error: 'Capacity window not found',
      code: 'WINDOW_NOT_FOUND',
    };
  }

  // Check if window has submissions
  const hasSubmissions = await windowHasSubmissions(windowId);
  if (hasSubmissions) {
    return {
      success: false,
      error: 'Cannot delete a capacity window with existing submissions. Please delete the submissions first.',
      code: 'HAS_SUBMISSIONS',
    };
  }

  // Delete capacity window
  const { error } = await supabase
    .from('capacity_windows')
    .delete()
    .eq('id', windowId);

  if (error) {
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }

  revalidatePath('/dashboard');
  revalidatePath(`/${baker.slug}`);

  return {
    success: true,
    data: undefined,
  };
}
