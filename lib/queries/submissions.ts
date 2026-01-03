import { createClient } from '@/lib/supabase/server';
import type { Submission } from '@/types/database';

/**
 * Get all submissions for a capacity window
 * Sorted by submission time (newest first)
 */
export async function getSubmissionsForWindow(windowId: string): Promise<Submission[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('capacity_window_id', windowId)
    .order('submitted_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Get a single submission by ID
 */
export async function getSubmissionById(submissionId: string): Promise<Submission | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', submissionId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data;
}

/**
 * Get all submissions for a baker (across all windows)
 * Sorted by submission time (newest first)
 */
export async function getSubmissionsForBaker(bakerId: string): Promise<Submission[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('baker_id', bakerId)
    .order('submitted_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Count submissions for a window
 */
export async function countSubmissionsForWindow(windowId: string): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('capacity_window_id', windowId);

  if (error) {
    throw error;
  }

  return count || 0;
}
