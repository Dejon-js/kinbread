import { createClient } from '@/lib/supabase/server';
import type { CapacityWindow } from '@/types/database';
import type { WindowWithStats, WindowWithSubmissions, PublicWindowView } from '@/types/views';

/**
 * Get all capacity windows for a baker with slot statistics
 * Sorted by date ascending
 */
export async function getWindowsForBaker(bakerId: string): Promise<WindowWithStats[]> {
  const supabase = await createClient();

  // Get windows with submission counts
  const { data: windows, error: windowsError } = await supabase
    .from('capacity_windows')
    .select('*')
    .eq('baker_id', bakerId)
    .order('date', { ascending: true });

  if (windowsError) {
    throw windowsError;
  }

  if (!windows || windows.length === 0) {
    return [];
  }

  // Get submission counts per window
  const { data: submissions, error: submissionsError } = await supabase
    .from('submissions')
    .select('capacity_window_id, slots_consumed')
    .eq('baker_id', bakerId);

  if (submissionsError) {
    throw submissionsError;
  }

  // Calculate used slots per window
  const usedSlotsMap = new Map<string, number>();
  for (const submission of submissions || []) {
    const current = usedSlotsMap.get(submission.capacity_window_id) || 0;
    usedSlotsMap.set(submission.capacity_window_id, current + submission.slots_consumed);
  }

  // Build windows with stats
  return windows.map((window) => {
    const used_slots = usedSlotsMap.get(window.id) || 0;
    return {
      ...window,
      used_slots,
      available_slots: Math.max(0, window.total_slots - used_slots),
    };
  });
}

/**
 * Get a single capacity window with its submissions and stats
 */
export async function getWindowWithSubmissions(
  windowId: string,
  bakerId: string
): Promise<WindowWithSubmissions | null> {
  const supabase = await createClient();

  // Get the window
  const { data: window, error: windowError } = await supabase
    .from('capacity_windows')
    .select('*')
    .eq('id', windowId)
    .eq('baker_id', bakerId)
    .single();

  if (windowError) {
    if (windowError.code === 'PGRST116') {
      return null;
    }
    throw windowError;
  }

  // Get submissions for this window
  const { data: submissions, error: submissionsError } = await supabase
    .from('submissions')
    .select('*')
    .eq('capacity_window_id', windowId)
    .order('submitted_at', { ascending: false });

  if (submissionsError) {
    throw submissionsError;
  }

  // Calculate used slots
  const used_slots = (submissions || []).reduce(
    (sum, s) => sum + s.slots_consumed,
    0
  );

  return {
    ...window,
    used_slots,
    available_slots: Math.max(0, window.total_slots - used_slots),
    submissions: submissions || [],
  };
}

/**
 * Get public-facing windows for a baker (for availability page)
 * Only includes dates >= today
 */
export async function getPublicWindowsForBaker(bakerId: string): Promise<PublicWindowView[]> {
  const supabase = await createClient();

  // Get today's date in ISO format
  const today = new Date().toISOString().split('T')[0];

  // Get windows
  const { data: windows, error: windowsError } = await supabase
    .from('capacity_windows')
    .select('id, date, total_slots')
    .eq('baker_id', bakerId)
    .gte('date', today)
    .order('date', { ascending: true });

  if (windowsError) {
    throw windowsError;
  }

  if (!windows || windows.length === 0) {
    return [];
  }

  // Get submission counts
  const windowIds = windows.map((w) => w.id);
  const { data: submissions, error: submissionsError } = await supabase
    .from('submissions')
    .select('capacity_window_id, slots_consumed')
    .in('capacity_window_id', windowIds);

  if (submissionsError) {
    throw submissionsError;
  }

  // Calculate used slots per window
  const usedSlotsMap = new Map<string, number>();
  for (const submission of submissions || []) {
    const current = usedSlotsMap.get(submission.capacity_window_id) || 0;
    usedSlotsMap.set(submission.capacity_window_id, current + submission.slots_consumed);
  }

  // Build public view
  return windows.map((window) => {
    const used_slots = usedSlotsMap.get(window.id) || 0;
    const available_slots = Math.max(0, window.total_slots - used_slots);
    return {
      id: window.id,
      date: window.date,
      available_slots,
      is_available: available_slots > 0,
    };
  });
}

/**
 * Get a capacity window for the public booking page
 * Returns the window and whether it's available for booking
 */
export async function getWindowForBooking(
  windowId: string,
  bakerId: string
): Promise<{ window: CapacityWindow; available: boolean } | null> {
  const supabase = await createClient();

  // Get the window
  const { data: window, error: windowError } = await supabase
    .from('capacity_windows')
    .select('*')
    .eq('id', windowId)
    .eq('baker_id', bakerId)
    .single();

  if (windowError) {
    if (windowError.code === 'PGRST116') {
      return null;
    }
    throw windowError;
  }

  // Check if date is in the past
  const today = new Date().toISOString().split('T')[0];
  if (window.date < today) {
    return { window, available: false };
  }

  // Get submission count for this window
  const { data: submissions, error: submissionsError } = await supabase
    .from('submissions')
    .select('slots_consumed')
    .eq('capacity_window_id', windowId);

  if (submissionsError) {
    throw submissionsError;
  }

  const usedSlots = (submissions || []).reduce((sum, s) => sum + s.slots_consumed, 0);
  const availableSlots = Math.max(0, window.total_slots - usedSlots);

  return {
    window,
    available: availableSlots > 0,
  };
}

/**
 * Get a single capacity window by ID
 */
export async function getWindowById(windowId: string): Promise<CapacityWindow | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('capacity_windows')
    .select('*')
    .eq('id', windowId)
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
 * Check if a window has any submissions
 */
export async function windowHasSubmissions(windowId: string): Promise<boolean> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('capacity_window_id', windowId);

  if (error) {
    throw error;
  }

  return (count || 0) > 0;
}

/**
 * Check if baker already has a window for the given date
 */
export async function windowExistsForDate(
  bakerId: string,
  date: string,
  excludeWindowId?: string
): Promise<boolean> {
  const supabase = await createClient();

  let query = supabase
    .from('capacity_windows')
    .select('*', { count: 'exact', head: true })
    .eq('baker_id', bakerId)
    .eq('date', date);

  if (excludeWindowId) {
    query = query.neq('id', excludeWindowId);
  }

  const { count, error } = await query;

  if (error) {
    throw error;
  }

  return (count || 0) > 0;
}

/**
 * Get dates that already have windows in a date range
 */
export async function getExistingDatesInRange(
  bakerId: string,
  startDate: string,
  endDate: string
): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('capacity_windows')
    .select('date')
    .eq('baker_id', bakerId)
    .gte('date', startDate)
    .lte('date', endDate);

  if (error) {
    throw error;
  }

  return (data || []).map((w) => w.date);
}
